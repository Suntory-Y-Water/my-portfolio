import PostsList from '@/app/feature/posts/PostsList';
import React from 'react';
import { Post, QiitaPost, ZennResponse } from '@/app/types';
import { QIITA_USERNAMES, ZENN_USERNAME } from '@/app/constants';
import { fetchPosts } from '@/lib/client';
import { envConfig } from '@/lib/utils';

export default async function Page() {
  const apiKey = envConfig.QIITA_ACCESS_TOKEN;
  const usernames = QIITA_USERNAMES;

  const zennApiUrl = `https://zenn.dev/api/articles?username=${ZENN_USERNAME}&order=latest`;
  const zennData = await fetchPosts<ZennResponse>(zennApiUrl);
  const posts: Post[] = zennData.articles.map((post) => {
    return {
      id: post.id.toString(),
      url: `https://zenn.dev${post.path}`,
      emoji: post.emoji,
      title: post.title,
      createdAt: post.published_at,
    };
  });

  for (const username of usernames) {
    const response = await fetchPosts<QiitaPost[]>(
      `https://qiita.com/api/v2/users/${username}/items?per_page=100`,
      {
        Authorization: `Bearer ${apiKey}`,
      },
    );
    posts.push(
      ...response.map((post) => {
        return {
          id: post.id,
          url: post.url,
          title: post.title,
          createdAt: post.created_at,
        };
      }),
    );
  }

  // postsをcreatedAtの降順にソート
  posts.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  return (
    <div>
      <h1>Posts🖊️</h1>
      <p className='pb-10'>
        思いつきで作成したアプリや、バグで苦戦したときの備忘録などをQiitaとZennに投稿しています。
      </p>
      <PostsList posts={posts} />
    </div>
  );
}
