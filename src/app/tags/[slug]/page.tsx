import { BlogCard } from '@/components/feature/content/blog-card';
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
    <section data-pagefind-ignore>
      <PageHeader heading={`${tagName} タグの記事一覧`} />
      <div className='space-y-6'>
        {posts.map((blog) => (
          <BlogCard key={blog.slug} data={blog} />
        ))}
      </div>
    </section>
  );
}
