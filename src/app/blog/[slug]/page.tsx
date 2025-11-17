import '@/styles/markdown.css';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CustomMarkdown } from '@/components/feature/content/custom-markdown';
import { GitHubEditButton } from '@/components/feature/content/github-edit-button';
import { TableOfContents } from '@/components/feature/content/table-of-contents';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { getTagSlug } from '@/config/tag-slugs';
import { getAllBlogPosts, getBlogPostBySlug } from '@/lib/markdown';
import { extractTOC } from '@/lib/toc';
import { absoluteUrl, formatDate } from '@/lib/utils';

export const revalidate = false;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    alternates: {
      canonical: absoluteUrl(`/blog/${post.slug}`),
    },
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      type: 'article',
      url: absoluteUrl(`/blog/${post.slug}`),
      images: [absoluteUrl(`/blog/ogp/${post.slug}`)],
      locale: 'ja_JP',
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metadata.title,
      description: post.metadata.description,
      images: [absoluteUrl(`/blog/ogp/${post.slug}`)],
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  };
}

export async function generateStaticParams() {
  const allPosts = await getAllBlogPosts();
  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // 目次を生成
  const tableOfContents = extractTOC(post.rawContent);

  // icon_urlを優先、なければiconのURLを使用
  const displayUrl =
    post.metadata.icon_url ||
    (post.metadata.icon?.startsWith('https://') ? post.metadata.icon : null);

  // 構造化データ (JSON-LD) の生成
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metadata.title,
    datePublished: post.metadata.date,
    dateModified: post.metadata.date,
    description: post.metadata.description,
    image: absoluteUrl(`/blog/ogp/${post.slug}`),
    author: {
      '@type': 'Person',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/opengraph-image.png'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/blog/${post.slug}`),
    },
  };

  return (
    <div>
      {/* 構造化データ (JSON-LD) */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className='min-h-[500px]'>
        {/* Icon */}
        {(displayUrl || post.metadata.icon) && (
          <div className='mb-6 flex justify-center'>
            {displayUrl ? (
              <Image
                src={displayUrl}
                alt={`Icon for ${post.metadata.title}`}
                width={80}
                height={80}
                priority
              />
            ) : (
              <div className='text-6xl'>{post.metadata.icon}</div>
            )}
          </div>
        )}

        {/* Metadata (Date & Tags) */}
        <div className='mb-6 flex flex-wrap items-center justify-between text-sm text-muted-foreground'>
          {post.metadata.date && (
            <div className='inline-flex items-center gap-1'>
              <Icons.calendar className='size-4' />
              <time dateTime={new Date(post.metadata.date).toISOString()}>
                {formatDate(post.metadata.date)}
              </time>
            </div>
          )}

          {post.metadata.tags && post.metadata.tags.length > 0 && (
            <div className='inline-flex flex-wrap gap-2'>
              {post.metadata.tags.map((tag) => (
                <Link key={tag} href={`/tags/${getTagSlug(tag)}`}>
                  <Badge className='px-2 py-0.5 text-xs'>{tag}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className='text-2xl font-bold leading-snug tracking-normal'>
          {post.metadata.title}
        </h1>

        {/* Description */}
        {post.metadata.description && (
          <p className='mt-4 text-foreground/80'>{post.metadata.description}</p>
        )}

        {/* Table of Contents */}
        {tableOfContents.length > 0 && (
          <TableOfContents items={tableOfContents} />
        )}

        {/* Article Content */}
        <div className='mt-8'>
          <CustomMarkdown source={post.rawContent} />
        </div>

        {/* Footer */}
        <footer className='mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-8'>
          <Button variant='ghost' asChild className='h-9 px-2'>
            <Link href='/blog' className='group inline-flex items-center'>
              <Icons.arrowLeft className='mr-2 size-4 transition-transform group-hover:-translate-x-1' />
              ブログ一覧に戻る
            </Link>
          </Button>

          <div className='flex items-center space-x-2'>
            <Link
              href={`/blog/${slug}.md`}
              className='inline-flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-primary'
            >
              <Icons.fileText className='size-4' />
              <span>Markdown ver</span>
            </Link>
            <GitHubEditButton filePath={post.filePath} />
          </div>
        </footer>
      </article>
    </div>
  );
}
