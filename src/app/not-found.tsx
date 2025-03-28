'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center py-20'>
      <h1 className='text-4xl font-bold mb-4'>404 - ページが見つかりませんでした</h1>
      <p className='text-muted-foreground mb-8'>
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <div className='flex gap-4'>
        <Link
          href='/'
          className='border border-primary text-primary px-6 py-2 rounded hover:bg-primary/10 transition-colors'
        >
          トップページへ
        </Link>
      </div>
    </div>
  );
}
