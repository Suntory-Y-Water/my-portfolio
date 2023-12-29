import { LiveName } from '@/app/types/types';
import Live from '@/components/live-checker/Live';
import React from 'react';

const page = async () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${API_URL}/api/lives`, {
    cache: 'no-store',
  });
  const liveLists: LiveName[] = await res.json();

  return (
    <div className='md:w-2/3'>
      <h1 className='pb-4 font-bold text-2xl'>参加したライブを選ぼう</h1>
      <Live params={liveLists} />
    </div>
  );
};

export default page;
