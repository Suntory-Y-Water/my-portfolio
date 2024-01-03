'use client';
import React from 'react';

const Loading = () => {
  return (
    <div className='flex items-center justify-center min-h-screen' aria-label='読み込み中'>
      <div className='animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent'></div>
    </div>
  );
};

export default Loading;
