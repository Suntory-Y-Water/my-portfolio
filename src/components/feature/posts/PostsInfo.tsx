import Link from 'next/link';

import ConvertDate from '@/components/feature/posts/ConvertDate';
import type { Post } from '@/types';
import Image from 'next/image';

type Props = {
  post: Post;
};

export default function PostsInfo({ post }: Props) {
  return (
    <li className='w-full'>
      <Link
        href={post.url}
        target='_blank'
        rel='noopener noreferrer'
        className='flex w-full h-full flex-col items-center justify-center gap-4 p-6 border rounded-3xl hover:outline-primary hover:outline-2 hover:outline hover:bg-muted/20 transform transition-transform duration-300 hover:scale-105'
      >
        {/* Zennのときだけ絵文字を表示する。 */}
        {post.source === 'Zenn' ? (
          <span className='text-6xl'>{post.emoji}</span>
        ) : post.source === 'Qiita' ? (
          <Image src='/qiita-icon.svg' alt='Qiita icon' width='60' height='60' />
        ) : (
          <Image src='/note-icon.svg' alt='note icon' width='60' height='60' />
        )}
        <p className='line-clamp-2 overflow-hidden break-all text-left font-medium'>
          {post.title}
        </p>
        <p className='text-muted-foreground text-xs tracking-widest'>
          <ConvertDate convertDate={post.createdAt} />
        </p>
      </Link>
    </li>
  );
}
