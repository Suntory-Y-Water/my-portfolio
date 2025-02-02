import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='max-w-2xl mx-auto px-4 py-12'>
      <div className='text-center space-y-4'>
        <h1 className='text-2xl font-bold text-gray-900'>記事が見つかりませんでした</h1>
        <p className='text-gray-600'>Notionの記事設定を確認してください：</p>
        <ul className='text-sm text-gray-600 list-disc list-inside'>
          <li>記事のタイトルが設定されているか</li>
          <li>記事が公開状態になっているか</li>
          <li>スラッグ（URL）が正しく設定されているか</li>
        </ul>
        <div className='mt-8'>
          <Link href='/' className='text-blue-600 hover:text-blue-800 transition-colors'>
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
