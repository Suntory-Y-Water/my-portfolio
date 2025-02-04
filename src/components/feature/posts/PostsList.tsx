import type { Post } from '@/types';
import PostsInfo from './PostsInfo';

type Props = {
  posts: Post[];
};

export default async function PostsList({ posts }: Props) {
  return (
    <ul className='grid place-items-center gap-6 items-stretch grid-cols-[repeat(auto-fit,minmax(240px,1fr))]'>
      {posts.map((post) => (
        <PostsInfo key={post.id} post={post} />
      ))}
    </ul>
  );
}
