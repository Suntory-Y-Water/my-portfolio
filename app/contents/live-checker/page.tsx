import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function LiveChecker() {
  return (
    <div className='px-4'>
      <h1 className='pb-4 font-bold text-2xl'>ライブチェッカー</h1>
      <div className='mb-4 space-y-1'>
        <p>自分がまだライブで聴いたことのない曲を一覧で表示することができます。</p>
        <p>ライブを選択するを押したあと、ガイドに従って入力してください。</p>
      </div>
      <Link href='/contents/live-checker/select-live'>
        <Button variant='default' className='w-full items-center justify-center p-6 tracking-tight'>
          今すぐ始める
        </Button>
      </Link>
    </div>
  );
}

export default LiveChecker;
