import { Suspense } from 'react';

import { QIITA_USERNAMES, ZENN_USERNAME } from '@/components/constants';
import PostsList from '@/components/feature/posts/PostsList';
import type { Post, QiitaPost, ZennResponse } from '@/components/types';
import PostsListSkeleton from '@/components/ui/post-list-skeleton';
import { fetchPosts } from '@/lib/client';
import { envConfig } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function PostsWithData() {
  const apiKey = envConfig.QIITA_ACCESS_TOKEN;
  const usernames = QIITA_USERNAMES;

  const zennApiUrl = `https://zenn.dev/api/articles?username=${ZENN_USERNAME}&order=latest`;
  const zennData = await fetchPosts<ZennResponse>(zennApiUrl);
  const posts: Post[] = zennData.articles.map((post) => ({
    id: post.id.toString(),
    url: `https://zenn.dev${post.path}`,
    emoji: post.emoji,
    title: post.title,
    createdAt: post.published_at,
  }));

  for (const username of usernames) {
    const response = await fetchPosts<QiitaPost[]>(
      `https://qiita.com/api/v2/users/${username}/items?per_page=100`,
      {
        Authorization: `Bearer ${apiKey}`,
      },
    );
    posts.push(
      ...response.map((post) => ({
        id: post.id,
        url: post.url,
        title: post.title,
        createdAt: post.created_at,
      })),
    );
  }

  posts.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  return <PostsList posts={posts} />;
}

export default function Page() {
  return (
    <div>
      <h1>記事一覧🖊️</h1>
      <p className='pb-10'>
        思いつきで作成したアプリや、バグで苦戦したときの備忘録などをQiitaとZennに投稿しています。
      </p>
      <Suspense fallback={<PostsListSkeleton />}>
        <PostsWithData />
      </Suspense>
    </div>
  );
}
