import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function LiveChecker() {
  return (
    <div className='px-4'>
      <h1 className='pb-4 font-bold text-2xl'>ライブチェッカー</h1>
      <div className=''>
        <p>自分がまだライブで聴いたことのない曲を一覧で表示することができます。</p>
        <p>ライブを選択するを押したあと、ガイドに従って入力してください。</p>
      </div>
      <Link href='/contents/live-checker/select-live'>
        <Button variant='default' className='w-full items-center justify-center p-6 tracking-tight'>
          ライブを選択する
        </Button>
      </Link>
    </div>
  );
}

export default LiveChecker;
