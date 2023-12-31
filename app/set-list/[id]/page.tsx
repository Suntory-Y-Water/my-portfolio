import React from 'react';
import { SongsSungProps } from '@/app/types/types';
import { headers } from 'next/headers';
import { config } from '@/lib/config';

const fetchData = async (host: string, params: { id: string }) => {
  const res = await fetch(`${config.apiPrefix}${host}/api/lives/${params.id}`, {
    cache: 'force-cache',
  });
  return res.json();
};

async function SetListDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // クエリパラメーターからライブ名を取得する
  const liveName = searchParams.live_name;
  const host = headers().get('host');
  const setLists: SongsSungProps[] = await fetchData(host!, params!);

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
    <div>
      <div className='max-w-3xl '>
        <h1 className='text-3xl font-bold mb-4'>{liveName}</h1>
        {Object.entries(groupedSetLists).map(([venue, lists]) => (
          <div key={venue} className='mb-8'>
            <h2 className='text-2xl font-semibold'>{venue}</h2>
            <ul>
              {lists.map((list) => (
                <li key={list.id} className='py-0.5'>
                  {list.song.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SetListDetail;
