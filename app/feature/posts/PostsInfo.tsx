import Link from 'next/link';
import QiitaIcon from '@/components/QiitaIcon';
import ConvertDate from '@/components/ConvertDate';
import { Post } from '@/app/types';

type Props = {
  post: Post;
};

export default async function PostsInfo({ post }: Props) {
  return (
    <li className='w-full'>
      <Link
        href={post.url}
        target='_blank'
        rel='noopener noreferrer'
        className='flex aspect-[4/3] w-full h-full flex-col items-center justify-center gap-4 p-6 border rounded-3xl hover:outline-primary hover:outline-2 hover:outline hover:bg-muted/90'
      >
        {/* Zennのときだけ絵文字を表示する。 */}
        {post.emoji ? <span className='text-6xl'>{post.emoji}</span> : <QiitaIcon />}
        <p className='line-clamp-2 overflow-hidden break-all text-left font-medium'>{post.title}</p>
        <p className='text-muted-foreground text-xs tracking-widest'>
          <ConvertDate convertDate={post.createdAt} />
        </p>
      </Link>
    </li>
  );
}
