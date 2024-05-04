import PostsList from '@/components/PostsList';
import React from 'react';

const page = () => (
  <div>
    <h1>Posts🖊️</h1>
    <p className='pb-10'>
      思いつきで作成したアプリや、バグで苦戦したときの備忘録などをQiitaとZennに投稿しています。
    </p>
    <PostsList />
  </div>
);

export default page;
