import PostsList from '@/app/feature/posts/PostsList';
import React from 'react';
import { Post, QiitaPost, ZennPost, ZennResponse } from '@/app/types';
import { QIITA_USERNAMES, REVALIDATE_TIME, ZENN_USERNAME } from '@/app/constants';

const page = async () => {
  const { QIITA_ACCESS_TOKEN } = process.env;
  const zennResponse = await fetch(
    `https://zenn.dev/api/articles?username=${ZENN_USERNAME}&order=latest`,
    { next: { revalidate: REVALIDATE_TIME } },
  );
  const zennData: ZennResponse = await zennResponse.json();
  const zennPosts: ZennPost[] = zennData.articles.map((post) => ({ ...post, source: 'Zenn' }));

  const usernames = QIITA_USERNAMES;
  const qiitaPosts: QiitaPost[] = [];

  for (const username of usernames) {
    const response = await fetch(`https://qiita.com/api/v2/users/${username}/items?per_page=100`, {
      headers: {
        Authorization: `Bearer ${QIITA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const data: QiitaPost[] = await response.json();
    qiitaPosts.push(...data.map((post) => ({ ...post, source: 'Qiita' as const })));
  }

  // 全てのポストを日付でソート
  const posts: Post[] = [...zennPosts, ...qiitaPosts].sort((a, b) => {
    const dateA = a.source === 'Zenn' ? new Date(a.published_at) : new Date(a.created_at);
    const dateB = b.source === 'Zenn' ? new Date(b.published_at) : new Date(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div>
      <h1>Posts🖊️</h1>
      <p className='pb-10'>
        思いつきで作成したアプリや、バグで苦戦したときの備忘録などをQiitaとZennに投稿しています。
      </p>
      <PostsList posts={posts} />
    </div>
  );
};

export default page;
