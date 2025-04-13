import { NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';
import { getAllBlogPosts } from '@/lib/mdx';
import type { BlogPost } from '@/lib/mdx';

// llms.txt の内容を生成する関数
const renderLlmsTxt = (posts: BlogPost[]) => `# ${siteConfig.name}

> ${siteConfig.description}

${
  posts.length > 0
    ? `## ブログ記事

${posts
  .map(
    (post) =>
      `- [${post.metadata.title}](${siteConfig.url}/blog/${post.slug}.md): ${post.metadata.description || ''}`
  )
  .join('\n')}
`
    : ''
}
`;

export async function GET() {
  const posts = await getAllBlogPosts();
  const markdownContent = renderLlmsTxt(posts);

  return new NextResponse(markdownContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
