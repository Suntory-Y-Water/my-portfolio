import Live from '@/components/live-checker/Live';
import React from 'react';
import { headers } from 'next/headers';
import { config } from '@/lib/config';
import { LiveName } from '@/app/types/types';

const fetchData = async (host: string) => {
  const res = await fetch(`${config.apiPrefix}${host}/api/lives`, {
    cache: 'force-cache',
  });
  return res.json();
};

const page = async () => {
  const host = headers().get('host');
  const liveLists: LiveName[] = await fetchData(host!);

  return (
    <div className='md:w-2/3'>
      <h1 className='pb-4 font-bold text-2xl'>参加したライブを選ぼう</h1>
      <Live params={liveLists} />
    </div>
  );
};

export default page;
