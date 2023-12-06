import React from 'react';
import { SongsSungProps } from '@/app/types/types';

async function SetListDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}) {
  // クエリパラメーターからライブ名を取得する
  const liveName = searchParams.liveName;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${API_URL}/api/lives/${params.id}`, { cache: 'no-store' });
  const setLists: SongsSungProps[] = await res.json();
  type GroupedData = {
    [key: string]: SongsSungProps[];
  };

  // 以降は、この型を使用してデータをグループ化
  const groupedSetLists = setLists.reduce<GroupedData>((acc, item) => {
    const key = item.venue.name;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  // 会場ごとにグループ化したライブをソートする
  Object.keys(groupedSetLists).forEach((key) => {
    groupedSetLists[key].sort((a, b) => a.id - b.id);
  });

  return (
    <div className='max-w-3xl '>
      <h1 className='text-3xl font-bold mb-4'>{liveName}</h1>
      {Object.entries(groupedSetLists).map(([venue, setLists]) => (
        <div key={venue} className='mb-8'>
          <h2 className='text-2xl font-semibold'>{venue}</h2>
          <ul>
            {setLists.map((setList, index) => (
              <li key={index} className='py-0.5'>
                {setList.song.title}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default SetListDetail;
