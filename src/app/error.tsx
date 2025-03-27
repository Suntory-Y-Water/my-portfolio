'use client';
import Link from 'next/link';

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  console.error(error);
  return (
    <div className='flex flex-col items-center justify-center py-20'>
      <h1 className='text-4xl font-bold mb-4'>エラーが発生しました</h1>
      <p className='text-muted-foreground mb-8'>
        申し訳ありませんが、問題が発生しました。しばらくしてからもう一度お試しください。
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
