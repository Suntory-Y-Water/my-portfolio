'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BlogSearchDialog } from '@/components/feature/search/blog-search-dialog';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '@/lib/markdown';
import { cn } from '@/lib/utils';

type SearchButtonProps = {
  /** 検索対象のブログ記事リスト */
  posts: BlogPost[];
  /** ボタンのバリアント（デフォルトは'ghost'） */
  variant?: 'default' | 'ghost' | 'outline';
  /** 追加のCSSクラス */
  className?: string;
};

/**
 * ブログ検索を開くボタンコンポーネント
 *
 * Command+K（Mac）またはCtrl+K（Windows/Linux）でダイアログを開くキーボードショートカットに対応します。
 * モバイルではアイコンのみ、デスクトップでは「検索」とキーボードショートカットヒントを表示します。
 *
 * @param posts - 検索対象のブログ記事リスト
 * @param variant - ボタンのスタイルバリアント
 * @param className - 追加のCSSクラス
 *
 * @example
 * ```tsx
 * const posts = await getAllBlogPosts();
 * <SearchButton posts={posts} />
 * ```
 */
export function SearchButton({
  posts,
  variant = 'ghost',
  className,
}: SearchButtonProps) {
  const [open, setOpen] = useState(false);

  // Command+K または Ctrl+K でダイアログを開く
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Button
        variant={variant}
        size='sm'
        onClick={() => setOpen(true)}
        className={cn(
          'group relative h-9 w-9 px-0 md:w-auto md:justify-start md:px-3 md:pr-2',
          className,
        )}
        aria-label='検索'
      >
        {/* アイコン */}
        <Search className='size-4 shrink-0' />

        {/* デスクトップ表示：テキストとキーボードショートカット */}
        <span className='hidden md:ml-2 md:inline'>検索</span>
        <kbd className='pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:inline-flex'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </Button>

      {/* 検索ダイアログ */}
      <BlogSearchDialog posts={posts} open={open} onOpenChange={setOpen} />
    </>
  );
}
