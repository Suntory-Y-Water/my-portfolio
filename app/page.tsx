import React from 'react';

export default function Home() {
  return (
    <div className='px-4'>
      <h1 className='pb-4 font-bold text-3xl md:text-4xl lg:text-5xl'>Profile</h1>
      <div className='mt-4 space-y-1'>
        <h2 className='font-bold text-2xl'>Sui</h2>
        <p>東京都で活動しているエンジニアです。</p>
      </div>
      <div className='mt-4 space-y-1'>
        <h2 className='font-bold text-2xl'>職歴</h2>
        <p>作成中...</p>
      </div>
      <div className='mt-4 space-y-1'>
        <h2 className='font-bold text-2xl'>その他</h2>
        <p>作成中...</p>
      </div>
    </div>
  );
}
