'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h1 className='grid place-items-center py-40 text-2xl'>
        404 - ページが見つかりませんでした😭
      </h1>

      <div className='flex justify-center'>
        <Link href='/' className='hover:border-b-2 hover:border-primary'>
          最初の画面に戻る💨
        </Link>
      </div>
    </div>
  );
}
