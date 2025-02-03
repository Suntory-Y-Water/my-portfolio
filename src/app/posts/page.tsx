import { Suspense } from 'react';

import PostsList from '@/components/feature/posts/PostsList';
import PostsListSkeleton from '@/components/ui/post-list-skeleton';
import { QIITA_USERNAMES, ZENN_USERNAME } from '@/constants';
import { fetchPosts } from '@/lib/client';
import { processEnv } from '@/lib/utils';
import type { Post, QiitaPost, ZennResponse } from '@/types';

export const revalidate = 60;

async function PostsWithData() {
  const apiKey = processEnv.QIITA_ACCESS_TOKEN;
  const usernames = QIITA_USERNAMES;

  // 並列処理でデータを取得
  const [zennData, qiitaData] = await Promise.all([
    fetchPosts<ZennResponse>({
      apiUrl: `https://zenn.dev/api/articles?username=${ZENN_USERNAME}&order=latest`,
    }),
    Promise.all(
      usernames.map((username) =>
        fetchPosts<QiitaPost[]>({
          apiUrl: `https://qiita.com/api/v2/users/${username}/items?per_page=100`,
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }),
      ),
    ),
  ]);

  // ZennとQiitaの記事をマージしてソート
  const posts: Post[] = [
    ...zennData.articles.map((post) => ({
      id: post.id.toString(),
      url: `https://zenn.dev${post.path}`,
      emoji: post.emoji,
      title: post.title,
      createdAt: post.published_at,
    })),
    ...qiitaData.flat().map((post) => ({
      id: post.id,
      url: post.url,
      title: post.title,
      createdAt: post.created_at,
    })),
  ].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  return <PostsList posts={posts} />;
}

export default function Page() {
  return (
    <div>
      <h1 className='text-4xl font-semibold tracking-wide md:text-[40px] pb-6'>
        記事一覧🖊️
      </h1>
      <p className='pb-10'>
        思いつきで作成したアプリや、バグで苦戦したときの備忘録などをQiitaとZennに投稿しています。
      </p>
      <Suspense fallback={<PostsListSkeleton />}>
        <PostsWithData />
      </Suspense>
    </div>
  );
}
