import React from 'react';
import lives from '../../../data/liveName.json';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const SetList = () => {
  return (
    <div className='px-4'>
      <h1 className='pb-4 text-navy-blue font-bold text-2xl'>ライブ一覧</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {lives.map((live) => (
          <div
            key={live.id}
            className='rounded-lg p-8 text-slate-500 border-2 text-center border-slate-500 hover:border-navy-blue hover:text-navy-blue'
          >
            <Link href={`/contents/setList/${live.id}`}>
              <div className='flex justify-center items-center'>
                <h2 className='text-lg font-bold mr-2'>{live.name}</h2>
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
