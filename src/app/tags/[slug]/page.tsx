import { siteConfig } from '@/config/site';
import { getAllTags, getBlogPostsByTagSlug } from '@/lib/mdx';
import { absoluteUrl } from '@/lib/utils';
import { BlogCard } from '@/components/feature/content/blog-card';
import { PageHeader } from '@/components/shared/page-header';

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;

  const decodedSlug = decodeURIComponent(slug);

  return {
    title: `「${decodedSlug}」タグの記事一覧`,
    description: `「${decodedSlug}」タグの記事一覧を表示しています。`,
    openGraph: {
      title: `「${decodedSlug}」タグの記事一覧`,
      description: `「${decodedSlug}」タグの記事一覧を表示しています。`,
      type: 'article',
      url: absoluteUrl(`/tag/${decodedSlug}`),
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `「${decodedSlug}」タグの記事一覧`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `「${decodedSlug}」タグの記事一覧`,
      description: `「${decodedSlug}」タグの記事一覧を表示しています。`,
      images: [siteConfig.ogImage],
    },
  };
}

export async function generateStaticParams() {
  const allTags = await getAllTags();
  return allTags.map((tag) => ({
    slug: tag,
  }));
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;

  // Decode Japanese tags
  const decodedSlug = decodeURIComponent(slug);

  const posts = await getBlogPostsByTagSlug(decodedSlug);

  return (
    <section>
      <PageHeader heading={`${decodedSlug} タグの記事一覧`} />
      <div className='space-y-6'>
        {posts.map((blog) => (
          <BlogCard key={blog.slug} data={blog} />
        ))}
      </div>
    </section>
  );
}
