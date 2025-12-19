import { siteConfig } from '@/config/site';
import { getAllBlogPosts } from '@/lib/markdown';

export async function GET() {
  const baseUrl = import.meta.env.PUBLIC_APP_URL || siteConfig.url;
  const posts = await getAllBlogPosts();

  const rssXml = `
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>${siteConfig.name}</title>
        <link>${baseUrl}</link>
        <description>${siteConfig.blogDescription}</description>
        <language>ja</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
        <image>
          <url>${baseUrl}/favicon.png</url>
          <title>${siteConfig.name}</title>
          <link>${baseUrl}</link>
        </image>
        ${posts
          .map((post) => {
            return `
              <item>
                <title><![CDATA[${post.data.title}]]></title>
                <link>${baseUrl}/blog/${post.id}</link>
                <guid isPermaLink="true">${baseUrl}/blog/${post.id}</guid>
                <pubDate>${new Date(post.data.date).toUTCString()}</pubDate>
                <description><![CDATA[${post.data.description || ''}]]></description>
                ${
                  post.data.tags
                    ? post.data.tags
                        .map((tag) => `<category>${tag}</category>`)
                        .join('')
                    : ''
                }
              </item>
            `;
          })
          .join('')}
      </channel>
    </rss>
  `.trim();

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
