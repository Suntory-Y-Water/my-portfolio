import ContentsList from '@/app/feature/contents/ContentsList';
import { getContentsList } from '@/lib/client';
import React from 'react';

const page = async () => {
  const { contents } = await getContentsList();
  return (
    <div>
      <h1>Contents🖥️</h1>
      <p className='pb-10'>今まで作成したアプリなどを紹介します。</p>
      <ContentsList params={contents} />
    </div>
  );
};

export default page;
