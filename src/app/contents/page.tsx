import { ContentCard } from '@/components/feature/contents/content-card';
import { getAllPosts, getDatabase } from '@/lib/notion';
import Image from 'next/image';

type Props = {
  searchParams: { page?: string };
};

export default async function Home({ searchParams }: Props) {
  const POSTS_PER_PAGE = 5;
  const currentPage = Number(searchParams.page) || 1;

  // API実行
  const posts = await getAllPosts();
  const dbInfo = await getDatabase();

  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const offset = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = posts.slice(offset, offset + POSTS_PER_PAGE);

  return (
    <div className='max-w-2xl mx-auto px-4'>
      {dbInfo.cover && (
        <Image
          src={dbInfo.cover}
          width={768}
          height={578}
          alt='cover image'
          className='rounded object-cover'
        />
      )}

      <div className='space-y-12 my-4'>
        {currentPosts.map((post) => (
          <ContentCard key={post.id} post={post} />
        ))}
      </div>

      {/* <Pagination currentPage={currentPage} totalPages={totalPages} /> */}
    </div>
  );
}
