import { visit } from 'unist-util-visit';
import type { Element, Root } from 'hast';
import { getOGData } from '@/actions/fetch-og-metadata';
import { siteConfig } from '@/config/site';
import { getBlogPostBySlug } from '@/lib/markdown';

interface LinkCardData {
  url: string;
  title: string;
  description: string;
  image?: string;
  isInternal: boolean;
  error: boolean;
}

function isInternalBlogLink(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.startsWith('/blog/');
  } catch {
    return url.startsWith('/blog/');
  }
}

function getSlugFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    return parts[parts.length - 1];
  } catch {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
}

async function fetchLinkCardData(url: string): Promise<LinkCardData> {
  const isInternal = !url.startsWith('http') && isInternalBlogLink(url);

  // Internal blog link
  if (isInternal) {
    try {
      const slug = getSlugFromUrl(url);
      const post = await getBlogPostBySlug(slug);

      if (!post) {
        return {
          url,
          title: 'Page Not Found',
          description: 'This page may have been moved or deleted.',
          isInternal: true,
          error: true,
        };
      }

      return {
        url,
        title: post.metadata.title,
        description: post.metadata.description || '',
        image: siteConfig.ogImage,
        isInternal: true,
        error: false,
      };
    } catch (error) {
      console.error(`Error fetching internal blog post: ${url}`, error);
      return {
        url,
        title: 'Error',
        description: '',
        isInternal: true,
        error: true,
      };
    }
  }

  // External link
  try {
    const ogData = await getOGData(url);

    if (!ogData.title) {
      return {
        url,
        title: 'Page Not Found',
        description: 'Failed to fetch link preview.',
        isInternal: false,
        error: true,
      };
    }

    return {
      url,
      title: ogData.title,
      description: ogData.description || '',
      image: ogData.image,
      isInternal: false,
      error: false,
    };
  } catch (error) {
    console.error(`Error fetching OG data for ${url}:`, error);
    return {
      url,
      title: 'Error',
      description: '',
      isInternal: false,
      error: true,
    };
  }
}

function createLinkCardHTML(data: LinkCardData): string {
  const { url, title, description, image, isInternal, error } = data;
  const hostname = url.startsWith('http') ? new URL(url).hostname : '';

  const cardClasses = `group my-4 flex overflow-hidden rounded-lg border bg-card transition-all duration-200 hover:bg-accent/5 hover:shadow-md ${
    error ? 'border-border/50 bg-card/50' : ''
  }`;

  const linkAttrs = isInternal
    ? `href="${url}" class="${cardClasses}"`
    : `href="${url}" target="_blank" rel="noopener noreferrer" class="${cardClasses}"`;

  const iconSection = isInternal
    ? `<span class="flex items-center gap-1.5">
        <div class="size-4 rounded-full bg-primary/10">
          <span class="flex size-full items-center justify-center text-[10px] font-bold text-primary">B</span>
        </div>
        <span>Blog Post</span>
      </span>`
    : `<div class="relative size-4 overflow-hidden rounded-full bg-muted">
        <img src="https://www.google.com/s2/favicons?domain=${hostname}&sz=32" alt="" class="object-cover" loading="lazy" width="16" height="16" />
      </div>
      <span>${hostname.replace(/^www\./, '')}</span>
      <svg class="size-3 text-muted-foreground/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>`;

  const imageSection = image
    ? `<div class="hidden w-[148px] shrink-0 sm:block">
        <div class="relative size-full">
          <img src="${image}" alt="${title}" class="size-full object-cover" loading="lazy" />
        </div>
      </div>`
    : `<div class="hidden w-[148px] shrink-0 bg-muted/30 sm:block">
        <div class="flex size-full items-center justify-center">
          <span class="text-4xl text-muted-foreground/20">${isInternal ? '📝' : '🔗'}</span>
        </div>
      </div>`;

  return `<a ${linkAttrs}>
    <div class="flex flex-1 flex-col gap-2 p-4">
      <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        ${iconSection}
      </div>
      <div class="flex-1">
        <h3 class="font-semibold leading-tight text-foreground transition-colors group-hover:text-accent">
          ${error ? 'Page Not Found' : title}
        </h3>
        ${
          description
            ? `<p class="mt-1.5 line-clamp-2 text-sm text-muted-foreground">${description}</p>`
            : ''
        }
      </div>
    </div>
    ${imageSection}
  </a>`;
}

function isPureUrlParagraph(node: Element): boolean {
  // <p><a href="url">url</a></p> の形式を検出
  if (node.tagName !== 'p' || !node.children || node.children.length !== 1) {
    return false;
  }

  const child = node.children[0];
  if (child.type !== 'element' || child.tagName !== 'a') {
    return false;
  }

  const href = child.properties?.href as string;
  if (!href || !href.startsWith('http')) {
    return false;
  }

  // リンクのテキストがURLと同じか確認
  if (child.children && child.children.length === 1) {
    const textNode = child.children[0];
    if (textNode.type === 'text' && textNode.value === href) {
      return true;
    }
  }

  return false;
}

export function rehypeLinkCard() {
  return async (tree: Root) => {
    const transformations: Array<{
      node: Element;
      index: number;
      parent: Element;
    }> = [];

    // プレーンURLを含むpタグを検出
    visit(tree, 'element', (node: Element, index, parent) => {
      if (isPureUrlParagraph(node) && parent && typeof index === 'number') {
        transformations.push({
          node,
          index,
          parent: parent as Element,
        });
      }
    });

    // 並列でOG情報を取得
    const linkCardDataPromises = transformations.map(async ({ node }) => {
      const aTag = node.children[0] as Element;
      const url = aTag.properties?.href as string;
      return fetchLinkCardData(url);
    });

    const linkCardDataList = await Promise.all(linkCardDataPromises);

    // HTMLノードに置き換え
    transformations.forEach(({ index, parent }, i) => {
      const linkCardData = linkCardDataList[i];
      const html = createLinkCardHTML(linkCardData);

      const htmlNode = {
        type: 'raw' as const,
        value: html,
      };

      parent.children[index] = htmlNode;
    });
  };
}
