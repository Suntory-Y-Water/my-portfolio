import Image from 'next/image';
import Link from 'next/link';
import ConvertDate from '@/components/feature/posts/ConvertDate';
import type { Post } from '@/types';

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
        className='flex size-full flex-col items-center justify-center gap-4 rounded-3xl border p-6 transition-transform duration-300 hover:scale-105 hover:bg-muted/20 hover:outline hover:outline-2 hover:outline-primary'
      >
        {/* Zennのときだけ絵文字を表示する。 */}
        {post.source === 'Zenn' ? (
          <span className='text-6xl'>{post.emoji}</span>
        ) : post.source === 'Qiita' ? (
          <Image
            src='/qiita-icon.svg'
            alt='Qiita icon'
            width='60'
            height='60'
          />
        ) : (
          <Image src='/note-icon.svg' alt='note icon' width='60' height='60' />
        )}
        <p className='line-clamp-2 overflow-hidden break-all text-left font-medium'>
          {post.title}
        </p>
        <p className='text-xs tracking-widest text-muted-foreground'>
          <ConvertDate convertDate={post.createdAt} />
        </p>
      </Link>
    </li>
  );
}
