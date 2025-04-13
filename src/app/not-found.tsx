'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center py-20'>
      <h1 className='mb-4 text-4xl font-bold'>
        404 - ページが見つかりませんでした
      </h1>
      <p className='mb-8 text-muted-foreground'>
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <div className='flex gap-4'>
        <Link
          href='/'
          className='rounded border border-primary px-6 py-2 text-primary transition-colors hover:bg-primary/10'
        >
          トップページへ
        </Link>
      </div>
    </div>
  );
}
