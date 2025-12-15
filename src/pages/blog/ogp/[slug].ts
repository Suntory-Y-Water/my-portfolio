import type { APIContext } from 'astro';
import { getAllBlogPosts, getBlogPostBySlug } from '@/lib/markdown';
import { generateFallbackOgpImage, generateOgpImage } from '@/lib/ogp';

/**
 * 静的生成用のパスを生成
 * ビルド時に全ブログ記事のOGP画像を事前生成
 */
export async function getStaticPaths() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
}

/**
 * ブログ記事のOGP画像を動的に生成するAPIルートハンドラ
 *
 * @param context - Astro APIContext
 * @returns 1200x630のOGP画像を含むResponse
 */
export async function GET({ params }: APIContext) {
  const { slug } = params;

  if (!slug) {
    return new Response(null, {
      status: 404,
      statusText: 'Not Found',
    });
  }

  try {
    // 記事データ取得
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return new Response(null, {
        status: 404,
        statusText: 'Not Found',
      });
    }

    const title = post.metadata.title;
    const tags = post.metadata.tags || [];
    const iconPath = post.metadata.icon_url;

    // OGP画像生成
    const png = await generateOgpImage({ title, tags, iconPath });

    return new Response(Buffer.from(png), {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error generating OG image: ${message}`);

    // エラー時はフォールバック画像を返す
    const fallbackPng = await generateFallbackOgpImage();

    return new Response(Buffer.from(fallbackPng), {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  }
}
