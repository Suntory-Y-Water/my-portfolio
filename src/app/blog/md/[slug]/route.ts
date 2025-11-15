import { type NextRequest, NextResponse } from 'next/server';
import { getBlogPostBySlug } from '@/lib/markdown';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: NextRequest, { params }: Props) {
  const { slug } = await params;

  // slugから`.md`を削除してブログ検索する
  const post = await getBlogPostBySlug(slug.replace('.md', ''));
  if (!post) {
    return new NextResponse('Not found', { status: 404 });
  }

  const body = `# ${post.metadata.title}

  ${post.rawContent}
    `;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
