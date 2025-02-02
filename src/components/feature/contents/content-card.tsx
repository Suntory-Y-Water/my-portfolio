import type { NotionPosts } from '@/types';
import Link from 'next/link';
import { TagList } from './tag-list';

export function ContentCard({ post }: { post: NotionPosts }) {
  return (
    <article key={post.id} className='space-y-2'>
      <time className='text-gray-500'>{String(post.published)}</time>
      <h2 className='text-2xl font-bold hover:text-gray-600'>
        <Link href={`/contents/${post.slug}`}>{post.title}</Link>
      </h2>
      {post.description && <p className='text-gray-600'>{post.description}</p>}
      {post.tags && <TagList tags={post.tags} />}
    </article>
  );
}
