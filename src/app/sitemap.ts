import type { MetadataRoute } from 'next';
import { postsPerPage } from '@/config/blog';
import { siteConfig } from '@/config/site';
import { getAllBlogPosts, getAllTags } from '@/lib/mdx';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || siteConfig.url;

  const posts = await getAllBlogPosts();
  const tags = await getAllTags();

  const staticPages = [
    {
      url: baseUrl,
    },
    {
      url: `${baseUrl}/blog`,
    },
    {
      url: `${baseUrl}/posts`,
    },
  ];

  const blogEntries = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
  }));

  const tagEntries = tags.map((tag) => ({
    url: `${baseUrl}/tags/${tag}`,
  }));

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const paginationEntries = Array.from({ length: totalPages }, (_, i) => ({
    url: `${baseUrl}/blog/page/${i + 1}`,
  }));

  return [...staticPages, ...blogEntries, ...tagEntries, ...paginationEntries];
}
