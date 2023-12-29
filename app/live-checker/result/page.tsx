import React from 'react';
import Result from '@/components/live-checker/Result';

const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const ids = searchParams.venue_id;
  const res = await fetch(`${API_URL}/api/unheard/${ids}`, {
    cache: 'no-store',
  });

  const songLists = await res.json();

  return (
    <div className='md:w-2/3'>
      <h1 className='pb-4 font-bold text-2xl'>聴いたことない曲一覧</h1>
      <Result params={songLists} />
    </div>
  );
};

export default page;
