'use client';

import type { Post } from '@/types';
import { useState } from 'react';
import PostsFilter from './PostsFilter';
import PostsInfo from './PostsInfo';

type Props = {
  posts: Post[];
};

export default function PostsList({ posts }: Props) {
  const [selectedSource, setSelectedSource] = useState<string>('all');

  const filteredPosts =
    selectedSource === 'all'
      ? posts
      : posts.filter((post) => post.source === selectedSource);

  return (
    <div className='space-y-6'>
      <PostsFilter selectedSource={selectedSource} onSourceChange={setSelectedSource} />
      <ul className='grid place-items-center gap-6 items-stretch grid-cols-[repeat(auto-fit,minmax(240px,1fr))]'>
        {filteredPosts.map((post) => (
          <PostsInfo key={post.id} post={post} />
        ))}
      </ul>
    </div>
  );
}
