import React from 'react';
import lives from '@/data/liveSongs.json';

const SetListDetail = async ({ params }: { params: { id: string } }) => {
  // 会場ごとにデータをグループ化するための型を定義
  type GroupedLives = { [key: string]: string[] };

  const groupedLives = lives.reduce<GroupedLives>((acc, live) => {
    acc[live.venue] = acc[live.venue] || [];
    acc[live.venue].push(live.title);
    return acc;
  }, {});

  return (
    <div className='max-w-3xl mx-auto'>
      <h1 className='text-3xl font-bold mb-4'>{params.id}</h1>
      {Object.entries(groupedLives).map(([venue, titles]) => (
        <div key={venue} className='mb-8'>
          <h2 className='text-2xl font-semibold'>{venue}</h2>
          <ul>
            {titles.map((title, index) => (
              <li key={index} className='py-0.5'>
                {title}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SetListDetail;
