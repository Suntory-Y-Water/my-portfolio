import Link from 'next/link';
import QiitaIcon from '@/components/QiitaIcon';
import ConvertDate from '@/components/ConvertDate';
import { Post } from '@/app/types';

type Props = {
  posts: Post[];
};

const PostsList = async ({ posts }: Props) => {
  return (
    <ul className='grid place-items-center gap-7 items-stretch grid-cols-[repeat(auto-fit,minmax(240px,1fr))]'>
      {posts.map((post) => (
        <li key={post.id} className='w-full'>
          {post.source === 'Zenn' ? (
            <Link
              href={`https://zenn.dev/${post.path}`}
              target='_blank'
              rel='noopener noreferrer'
              className='flex aspect-[4/3] w-full h-full flex-col items-center justify-center gap-4 p-6 border rounded-3xl hover:outline-primary hover:outline-2 hover:outline hover:bg-muted/90'
            >
              <span className='text-6xl'>{post.emoji}</span>
              <p className='line-clamp-2 overflow-hidden break-all text-left font-medium'>
                {post.title}
              </p>
              <p className='text-muted-foreground text-xs tracking-widest'>
                <ConvertDate convertDate={post.published_at} />
              </p>
            </Link>
          ) : (
            <Link
              href={post.url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex aspect-[4/3] w-full h-full flex-col items-center justify-center gap-4 p-6 border rounded-3xl hover:outline-primary hover:outline-2 hover:outline hover:bg-muted/90'
            >
              <QiitaIcon />
              <p className='line-clamp-2 overflow-hidden break-all text-left font-medium'>
                {post.title}
              </p>
              <p className='text-muted-foreground text-xs tracking-widest'>
                <ConvertDate convertDate={post.created_at} />
              </p>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
};

export default PostsList;
