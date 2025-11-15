'use client';

import { useState } from 'react';
import type { Post } from '@/types';
import PostsFilter from './PostsFilter';
import PostsInfo from './PostsInfo';

type Props = {
  posts: Post[];
};

/**
 * 投稿一覧を表示するコンポーネント
 *
 * このコンポーネントは投稿のリストを受け取り、ソース別にフィルタリング可能な投稿一覧を表示します。
 * フィルター機能により、すべての投稿、Zennのみ、Qiitaのみ、noteのみを選択して表示できます。
 * 投稿はグリッドレイアウトで表示され、各投稿はPostsInfoコンポーネントで描画されます。
 *
 * @param posts - 表示する投稿データの配列。各投稿にはid、title、source、url、createdAtなどのプロパティが含まれます
 * @returns 投稿一覧コンポーネント
 *
 * @example
 * ```tsx
 * import PostsList from '@/components/feature/posts/PostsList';
 * import type { Post } from '@/types';
 *
 * const posts: Post[] = [
 *   {
 *     id: '1',
 *     title: 'TypeScriptの型定義について',
 *     source: 'Zenn',
 *     url: 'https://zenn.dev/example',
 *     createdAt: '2025-01-15',
 *     emoji: '📝',
 *   },
 *   {
 *     id: '2',
 *     title: 'Reactのパフォーマンス最適化',
 *     source: 'Qiita',
 *     url: 'https://qiita.com/example',
 *     createdAt: '2025-01-10',
 *   },
 * ];
 *
 * export default function PostsPage() {
 *   return <PostsList posts={posts} />;
 * }
 * ```
 */
export default function PostsList({ posts }: Props) {
  const [selectedSource, setSelectedSource] = useState<string>('all');

  const filteredPosts =
    selectedSource === 'all'
      ? posts
      : posts.filter((post) => post.source === selectedSource);

  return (
    <div className='space-y-6'>
      <PostsFilter
        selectedSource={selectedSource}
        onSourceChange={setSelectedSource}
      />
      <ul className='grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] place-items-center items-stretch gap-6'>
        {filteredPosts.map((post) => (
          <PostsInfo key={post.id} post={post} />
        ))}
      </ul>
    </div>
  );
}
