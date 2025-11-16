import type { MetadataRoute } from 'next';
import { postsPerPage } from '@/config/blog';
import { siteConfig } from '@/config/site';
import { getAllBlogPosts, getAllTagSlugs } from '@/lib/markdown';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || siteConfig.url;

  const posts = await getAllBlogPosts();
  const tagSlugs = await getAllTagSlugs();

  // 静的ページ
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
    },
  ];

  // ブログ記事
  const blogEntries = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.metadata.date),
    changeFrequency: 'weekly' as const,
  }));

  // タグページ
  const tagEntries = tagSlugs.map((slug) => ({
    url: `${baseUrl}/tags/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
  }));

  // ページネーション
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const paginationEntries = Array.from({ length: totalPages }, (_, i) => ({
    url: `${baseUrl}/blog/page/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
  }));

  return [...staticPages, ...blogEntries, ...tagEntries, ...paginationEntries];
}
