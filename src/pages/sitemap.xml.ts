import type { APIRoute } from 'astro';
import { BLOG_CONSTANTS, SITE_CONSTANTS } from '@/constants';
import { getAllBlogPosts, getAllTagSlugs } from '@/lib/markdown';

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
  const tagSlugs = await getAllTagSlugs();

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
      url: `${baseUrl}/blog/${post.slug}`,
      lastmod: new Date(post.metadata.date).toISOString(),
      changefreq: 'weekly',
    });
  }

  // タグページ
  const tagEntries: SitemapEntry[] = [];
  for (const slug of tagSlugs) {
    tagEntries.push({
      url: `${baseUrl}/tags/${slug}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
    });
  }

  // ページネーション
  const totalPages = Math.ceil(posts.length / BLOG_CONSTANTS.POSTS_PER_PAGE);
  const paginationEntries: SitemapEntry[] = [];
  for (let i = 0; i < totalPages; i++) {
    paginationEntries.push({
      url: `${baseUrl}/blog/page/${i + 1}`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
    });
  }

  // すべてのエントリを結合
  const allEntries = [
    ...staticPages,
    ...blogEntries,
    ...tagEntries,
    ...paginationEntries,
  ];

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
