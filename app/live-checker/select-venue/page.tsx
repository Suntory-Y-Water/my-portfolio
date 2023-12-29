import Venue from '@/components/live-checker/Venue';
import React from 'react';
import { VenueProps } from '@/app/types/types';

const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const liveName = searchParams.live_id;

  const res = await fetch(`${API_URL}/api/venues/${liveName}`, {
    cache: 'no-store',
  });

  const venueLists: VenueProps[] = await res.json();

  return (
    <div className='md:w-2/3'>
      <h1 className='pb-4 font-bold text-2xl'>参加した会場を選ぼう</h1>
      <Venue params={venueLists} />
    </div>
  );
};

export default page;
