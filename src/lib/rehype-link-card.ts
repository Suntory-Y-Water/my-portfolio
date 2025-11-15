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

/**
 * リンクカードのマーカーHTMLを生成
 *
 * クライアント側でLinkCardコンポーネントをマウントするためのマーカー要素を返します。
 * data-link-card属性にLinkCardコンポーネントのpropsをJSON形式で埋め込みます。
 */
function createLinkCardHTML(data: LinkCardData): string {
  // LinkCardコンポーネントのpropsをJSON文字列化
  const propsJson = JSON.stringify(data)
    .replace(/"/g, '&quot;') // ダブルクォートをエスケープ
    .replace(/'/g, '&#39;'); // シングルクォートをエスケープ

  return `<div class="link-card-container my-4" data-link-card="${propsJson}"></div>`;
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
