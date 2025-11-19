'use client';

import Fuse from 'fuse.js';
import { Calendar, ChevronRight, FileText, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { SEARCH_CONSTANTS } from '@/constants';
import type { BlogPost } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';

type BlogSearchDialogProps = {
  /** 全ブログ記事のリスト */
  posts: BlogPost[];
  /** ダイアログの開閉状態 */
  open: boolean;
  /** ダイアログを閉じるコールバック */
  onOpenChange: (open: boolean) => void;
};

/**
 * ブログ検索ダイアログコンポーネント
 *
 * Fuse.jsを使用したファジー検索により、ブログ記事を検索できます。
 * Command+Kキーボードショートカットで開くことができます。
 * 検索結果はページネーション付きで表示され、「もっと見る」ボタンで追加読み込みできます。
 *
 * @param posts - 検索対象のブログ記事リスト
 * @param open - ダイアログの開閉状態
 * @param onOpenChange - ダイアログの開閉を制御するコールバック
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * const posts = await getAllBlogPosts();
 *
 * <BlogSearchDialog posts={posts} open={open} onOpenChange={setOpen} />
 * ```
 */
export function BlogSearchDialog({
  posts,
  open,
  onOpenChange,
}: BlogSearchDialogProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState<number>(
    SEARCH_CONSTANTS.INITIAL_RESULTS_COUNT,
  );

  // Fuse.jsの検索インスタンスを作成（メモ化）
  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: 'metadata.title', weight: 2 },
          { name: 'metadata.description', weight: 1.5 },
          { name: 'metadata.tags', weight: 1 },
          { name: 'rawContent', weight: 0.5 },
        ],
        threshold: SEARCH_CONSTANTS.SEARCH_THRESHOLD,
        includeScore: true,
        minMatchCharLength: 2,
      }),
    [posts],
  );

  // 検索結果を取得
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return posts;
    }
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse, posts]);

  // 表示する検索結果（ページネーション適用）
  const displayedResults = useMemo(
    () => searchResults.slice(0, displayCount),
    [searchResults, displayCount],
  );

  // 「もっと見る」ボタンの表示判定
  const hasMore = displayCount < searchResults.length;
  const canLoadMore =
    hasMore && displayCount < SEARCH_CONSTANTS.MAX_RESULTS_COUNT;

  // 検索クエリが変更されたら表示件数をリセット
  // biome-ignore lint/correctness/useExhaustiveDependencies: 検索クエリ変更時にリセットしたい
  useEffect(() => {
    setDisplayCount(SEARCH_CONSTANTS.INITIAL_RESULTS_COUNT);
  }, [searchQuery]);

  // ダイアログが閉じられたら検索クエリと表示件数をリセット
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setDisplayCount(SEARCH_CONSTANTS.INITIAL_RESULTS_COUNT);
    }
  }, [open]);

  // 「もっと見る」ボタンのハンドラー
  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) =>
      Math.min(
        prev + SEARCH_CONSTANTS.LOAD_MORE_COUNT,
        SEARCH_CONSTANTS.MAX_RESULTS_COUNT,
      ),
    );
  }, []);

  // 記事を選択したときのハンドラー
  const handleSelectPost = useCallback(
    (slug: string) => {
      onOpenChange(false);
      router.push(`/blog/${slug}`);
    },
    [onOpenChange, router],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder='記事を検索...'
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {searchQuery
            ? '検索結果が見つかりませんでした。'
            : '検索キーワードを入力してください。'}
        </CommandEmpty>
        <CommandGroup
          heading={
            searchQuery
              ? `検索結果 (${searchResults.length}件)`
              : `すべての記事 (${posts.length}件)`
          }
        >
          {displayedResults.map((post) => (
            <CommandItem
              key={post.slug}
              value={post.slug}
              onSelect={() => handleSelectPost(post.slug)}
              className='flex flex-col items-start gap-2 px-3 py-3'
            >
              {/* タイトルとアイコン */}
              <div className='flex w-full items-center gap-2'>
                <FileText className='size-4 shrink-0 text-muted-foreground' />
                <span className='flex-1 truncate font-medium'>
                  {post.metadata.title}
                </span>
                <ChevronRight className='size-4 shrink-0 text-muted-foreground' />
              </div>

              {/* 説明文 */}
              {post.metadata.description && (
                <p className='line-clamp-2 w-full text-xs text-muted-foreground'>
                  {post.metadata.description}
                </p>
              )}

              {/* メタデータ（日付・タグ） */}
              <div className='flex w-full flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                {/* 日付 */}
                <div className='flex items-center gap-1'>
                  <Calendar className='size-3' />
                  <time dateTime={post.metadata.date}>
                    {formatDate(post.metadata.date)}
                  </time>
                </div>

                {/* タグ */}
                {post.metadata.tags && post.metadata.tags.length > 0 && (
                  <div className='flex items-center gap-1'>
                    <Tag className='size-3' />
                    <div className='flex flex-wrap gap-1'>
                      {post.metadata.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant='secondary'
                          className='px-1.5 py-0 text-[10px]'
                        >
                          {tag}
                        </Badge>
                      ))}
                      {post.metadata.tags.length > 3 && (
                        <span className='text-[10px]'>
                          +{post.metadata.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CommandItem>
          ))}

          {/* 「もっと見る」ボタン */}
          {canLoadMore && (
            <div className='flex justify-center p-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleLoadMore}
                className='w-full'
              >
                もっと見る (
                {Math.min(
                  SEARCH_CONSTANTS.LOAD_MORE_COUNT,
                  searchResults.length - displayCount,
                )}
                件)
              </Button>
            </div>
          )}

          {/* 最大表示件数に達した場合のメッセージ */}
          {hasMore &&
            displayCount >= SEARCH_CONSTANTS.MAX_RESULTS_COUNT &&
            searchResults.length > SEARCH_CONSTANTS.MAX_RESULTS_COUNT && (
              <div className='p-3 text-center text-xs text-muted-foreground'>
                {searchResults.length - SEARCH_CONSTANTS.MAX_RESULTS_COUNT}
                件以上の結果があります。検索キーワードを絞り込んでください。
              </div>
            )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
