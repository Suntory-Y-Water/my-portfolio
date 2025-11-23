import Link from 'next/link';
import { BlogCard } from '@/components/feature/content/blog-card';
import { Icons } from '@/components/icons';
import { PageHeader } from '@/components/shared/page-header';
import { siteConfig } from '@/config/site';
import { getTagNameFromSlug } from '@/config/tag-slugs';
import { getAllTagSlugs, getBlogPostsByTagSlug } from '@/lib/markdown';
import { absoluteUrl } from '@/lib/utils';

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;
  const tagName = getTagNameFromSlug(slug);

  if (!tagName) {
    return {
      title: 'タグが見つかりません',
      description: '指定されたタグは存在しません。',
    };
  }

  return {
    title: `「${tagName}」タグの記事一覧`,
    description: `「${tagName}」タグの記事一覧を表示しています。`,
    openGraph: {
      title: `「${tagName}」タグの記事一覧`,
      description: `「${tagName}」タグの記事一覧を表示しています。`,
      type: 'article',
      url: absoluteUrl(`/tags/${slug}`),
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `「${tagName}」タグの記事一覧`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `「${tagName}」タグの記事一覧`,
      description: `「${tagName}」タグの記事一覧を表示しています。`,
      images: [siteConfig.ogImage],
    },
    alternates: {
      canonical: absoluteUrl(`/tags/${slug}`),
    },
  };
}

export async function generateStaticParams() {
  const allTagSlugs = await getAllTagSlugs();

  return allTagSlugs.map((slug) => ({
    slug: slug,
  }));
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const tagName = getTagNameFromSlug(slug);

  if (!tagName) {
    return (
      <section>
        <PageHeader heading='タグが見つかりません' />
        <p className='text-muted-foreground'>指定されたタグは存在しません。</p>
      </section>
    );
  }

  const posts = await getBlogPostsByTagSlug(slug);

  return (
    <section data-pagefind-ignore className='space-y-10'>
      <div className='space-y-3 border-b border-border/60 pb-4'>
        <nav className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Link href='/' className='transition-colors hover:text-primary'>
            Home
          </Link>
          <Icons.chevronRight className='size-4' />
          <Link href='/tags' className='transition-colors hover:text-primary'>
            Tags
          </Link>
          <Icons.chevronRight className='size-4' />
          <span className='text-foreground'>{tagName}</span>
        </nav>

        <div className='flex flex-wrap items-end justify-between gap-3'>
          <h1 className='text-3xl font-bold tracking-tight md:text-4xl'>
            {tagName}
          </h1>
          <span className='text-sm font-mono text-muted-foreground'>
            Total {posts.length} posts
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {posts.map((blog) => (
          <BlogCard key={blog.slug} data={blog} />
        ))}
      </div>
    </section>
  );
}
