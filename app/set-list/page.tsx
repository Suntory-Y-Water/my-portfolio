import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { liveNames } from '@/data';

const SetList = () => {
  return (
    <div>
      <h1 className='pb-4 font-bold text-2xl'>ライブ一覧</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {liveNames.map((liveName) => (
          <div key={liveName.id} className='rounded-lg p-8 border border-collapse text-center'>
            <Link
              href={{
                pathname: `/set-list/${liveName.id}`,
                query: { live_name: `${liveName.name}` },
              }}
            >
              <div className='flex justify-center items-center'>
                <h2 className='text-base font-bold mr-2'>{liveName.name}</h2>
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
