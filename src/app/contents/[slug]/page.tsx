import { getAllPosts, getPostBySlug } from '@/lib/notion';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const NotionContent = dynamic(
  () => import('@/components/feature/notion/notion-content'),
  { ssr: true },
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug;
  const post = await getPostBySlug(slug);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!post) {
    return {
      title: '記事が見つかりません',
      description: 'お探しの記事は見つかりませんでした。',
    };
  }

  const title = post.title || '無題';
  const description = post.description;

  // URLのバリデーションと修正
  const getValidUrl = (url: string | undefined) => {
    if (!url) return 'http://localhost:3000';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  return {
    title,
    description,
    metadataBase: new URL(getValidUrl(baseUrl)),
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: String(post.published),
      images: [
        {
          url: `/post/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title || '無題',
      description,
      images: [`/post/${slug}/opengraph-image`],
      site: process.env.NEXT_PUBLIC_TWITTER_SITE_HANDLE,
    },
  };
}

export async function generateStaticParams() {
  try {
    const posts = await getAllPosts();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return []; // エラー時は空の配列を返す
  }
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <div className='text-center text-gray-600 py-12'>記事が見つかりませんでした</div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto px-4'>
      <article>
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex flex-wrap gap-2'>
            {post.tags &&
              post.tags.length > 0 &&
              post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className='text-sm bg-gray-100 px-2 py-1 rounded text-gray-700 hover:bg-gray-200 transition-colors'
                >
                  {tag}
                </span>
              ))}
          </div>
          {/* TODO */}
          <time className='text-sm text-gray-500'>{String(post.published)}</time>
        </div>
        <div className='prose prose-lg prose-blue max-w-none'>
          <NotionContent content={post.content} />
        </div>
      </article>
    </div>
  );
}
