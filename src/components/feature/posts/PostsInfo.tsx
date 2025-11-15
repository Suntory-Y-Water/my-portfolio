import Image from 'next/image';
import Link from 'next/link';
import ConvertDate from '@/components/feature/posts/ConvertDate';
import type { Post } from '@/types';

type Props = {
  post: Post;
};

/**
 * 個別の投稿カードを表示するコンポーネント
 *
 * このコンポーネントは1つの投稿データを受け取り、カード形式で表示します。
 * 投稿のソース（Zenn、Qiita、note）に応じて異なるアイコンを表示し、
 * タイトル、作成日、外部リンクを含むカードをレンダリングします。
 * カードにホバーすると拡大し、外部サイトへのリンクが開きます。
 *
 * @param post - 表示する投稿データ。id、title、source、url、createdAt、emoji（Zennの場合）などのプロパティを含みます
 * @returns 投稿カードコンポーネント
 *
 * @example
 * ```tsx
 * import PostsInfo from '@/components/feature/posts/PostsInfo';
 * import type { Post } from '@/types';
 *
 * const post: Post = {
 *   id: '1',
 *   title: 'TypeScriptの型定義について',
 *   source: 'Zenn',
 *   url: 'https://zenn.dev/example/articles/typescript-types',
 *   createdAt: '2025-01-15',
 *   emoji: '📝',
 * };
 *
 * export default function PostCard() {
 *   return (
 *     <ul className='grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6'>
 *       <PostsInfo post={post} />
 *     </ul>
 *   );
 * }
 * ```
 */
export default function PostsInfo({ post }: Props) {
  return (
    <li className='w-full'>
      <Link
        href={post.url}
        target='_blank'
        rel='noopener noreferrer'
        className='flex size-full flex-col items-center justify-center gap-4 rounded-3xl border p-6 transition-transform duration-300 hover:scale-105 hover:bg-muted/20 hover:outline hover:outline-2 hover:outline-primary'
      >
        {/* Zennのときだけ絵文字を表示する。 */}
        {post.source === 'Zenn' ? (
          <span className='text-6xl'>{post.emoji}</span>
        ) : post.source === 'Qiita' ? (
          <Image
            src='/qiita-icon.svg'
            alt='Qiita icon'
            width='60'
            height='60'
          />
        ) : (
          <Image src='/note-icon.svg' alt='note icon' width='60' height='60' />
        )}
        <p className='line-clamp-2 overflow-hidden break-all text-left font-medium'>
          {post.title}
        </p>
        <p className='text-xs tracking-widest text-muted-foreground'>
          <ConvertDate convertDate={post.createdAt} />
        </p>
      </Link>
    </li>
  );
}
