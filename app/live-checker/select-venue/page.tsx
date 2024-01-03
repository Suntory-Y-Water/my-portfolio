import Venue from '@/components/live-checker/Venue';
import React from 'react';
import { SearchParamsProps, VenueProps } from '@/app/types/types';
import { headers } from 'next/headers';
import { config } from '@/lib/config';

const fetchData = async (host: string, params: string | string[] | undefined) => {
  const res = await fetch(`${config.apiPrefix}${host}/api/venues/${params}`, {
    cache: 'force-cache',
  });
  return res.json();
};

const page = async ({ searchParams }: { searchParams: SearchParamsProps }) => {
  const params = searchParams.live_id;
  const host = headers().get('host');
  const venueLists: VenueProps[] = await fetchData(host!, params!);

  return (
    <div className='md:w-2/3'>
      <h1 className='pb-4 font-bold text-2xl'>参加した会場を選ぼう</h1>
      <Venue params={venueLists} />
    </div>
  );
};

export default page;
