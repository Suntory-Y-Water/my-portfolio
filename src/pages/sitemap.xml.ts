import type { APIRoute } from 'astro';
import { SITE_CONSTANTS } from '@/constants';
import { getAllBlogPosts } from '@/lib/markdown';

/**
 * サイトマップのエントリ型定義
 */
type SitemapEntry = {
  url: string;
  lastmod: string;
  changefreq:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
};

export const GET: APIRoute = async () => {
  const baseUrl = SITE_CONSTANTS.URL;

  const posts = await getAllBlogPosts();

  // 静的ページ
  const staticPages: SitemapEntry[] = [
    {
      url: baseUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
    },
    {
      url: `${baseUrl}/blog`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
    },
    {
      url: `${baseUrl}/about`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
    },
    {
      url: `${baseUrl}/tags`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
    },
  ];

  // ブログ記事
  const blogEntries: SitemapEntry[] = [];
  for (const post of posts) {
    blogEntries.push({
      url: `${baseUrl}/blog/${post.id}`,
      lastmod: new Date(post.data.date).toISOString(),
      changefreq: 'weekly',
    });
  }
  // すべてのエントリを結合
  const allEntries = [...staticPages, ...blogEntries];

  // XML生成
  const urlEntries: string[] = [];
  for (const entry of allEntries) {
    const priorityTag =
      entry.priority !== undefined
        ? `\n    <priority>${entry.priority}</priority>`
        : '';
    urlEntries.push(`  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>${priorityTag}
  </url>`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
