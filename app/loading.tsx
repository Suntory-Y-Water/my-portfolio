'use client';

import React from 'react';

function Loading() {
  return (
    <div className='flex items-center justify-center' aria-label='読み込み中'>
      <div className='animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent' />
    </div>
  );
}

export default Loading;
