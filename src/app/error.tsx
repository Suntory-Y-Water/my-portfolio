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
      <h1 className='mb-4 text-4xl font-bold'>エラーが発生しました</h1>
      <p className='mb-8 text-muted-foreground'>
        申し訳ありませんが、問題が発生しました。しばらくしてからもう一度お試しください。
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
