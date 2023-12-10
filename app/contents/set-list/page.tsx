import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LiveName } from '@/app/types/types';

const SetList = async () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${API_URL}/api/lives`, { cache: 'no-store' });
  const liveLists: LiveName[] = await res.json();

  return (
    <div className='px-4'>
      <h1 className='pb-4 text-navy-blue font-bold text-2xl'>ライブ一覧</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {liveLists.map((liveList) => (
          <div key={liveList.id} className='rounded-lg p-8 border border-collapse text-center'>
            <Link href={`/contents/set-list/${liveList.id}?live-name=${liveList.liveName}`}>
              <div className='flex justify-center items-center'>
                <h2 className='text-base font-bold mr-2'>{liveList.liveName}</h2>
                <ArrowRight size={20} />
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SetList;
