import React from 'react';
import Result from '@/components/live-checker/Result';
import { config } from '@/lib/config';
import { SearchParamsProps } from '@/app/types/types';
import { headers } from 'next/headers';
import { ResultProps } from '@/app/types/types';

const fetchData = async (host: string, params: string | string[] | undefined) => {
  const res = await fetch(`${config.apiPrefix}${host}/api/unheard/${params}`, {
    cache: 'force-cache',
  });
  return res.json();
};

const page = async ({ searchParams }: { searchParams: SearchParamsProps }) => {
  const params = searchParams.venue_id;
  const host = headers().get('host');
  const songLists: ResultProps[] = await fetchData(host!, params!);

  return (
    <div className='md:w-2/3'>
      <h1 className='pb-4 font-bold text-2xl'>聴いたことない曲一覧</h1>
      <Result params={songLists} />
    </div>
  );
};

export default page;
