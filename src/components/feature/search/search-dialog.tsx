'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { SEARCH_CONSTANTS } from '@/constants';
import type {
  PagefindModule,
  PagefindSearchResult,
  PagefindSearchResultItem,
} from '@/types/pagefind';

/**
 * PagefindのURLを正しいNext.jsのルートに変換
 *
 * Pagefindは`.next/server/app/xxx.html`のようなパスを返すため、
 * これを実際のルート（例: `/blog/xxx`）に変換する必要があります。
 *
 * @param pagefindUrl - Pagefindが返すURL（例: `/server/app/blog/article-title.html`）
 * @returns Next.jsの正しいルート（例: `/blog/article-title`）
 */
function normalizePagefindUrl(pagefindUrl: string): string {
  // `/server/app/`を削除して、`.html`拡張子も削除
  return pagefindUrl
    .replace(/^\/server\/app\//, '/') // /server/app/ を削除
    .replace(/\.html$/, ''); // .html を削除
}

/**
 * 検索ダイアログコンポーネント
 *
 * Pagefindを使用したブログ記事の検索機能を提供します。
 * Cmd+K (Mac) / Ctrl+K (Windows) でダイアログを開くことができます。
 *
 * @param open - ダイアログの開閉状態
 * @param onOpenChange - ダイアログの開閉状態を変更する関数
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <SearchDialog open={open} onOpenChange={setOpen} />
 * ```
 */
export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PagefindSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  /**
   * Cmd+K / Ctrl+K でダイアログを開く
   */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        e.key === SEARCH_CONSTANTS.KEYBOARD_SHORTCUT.key &&
        (e.metaKey || e.ctrlKey)
      ) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  /**
   * Pagefindで検索を実行
   *
   * ビルド後に生成されるPagefindファイルを動的にimportして検索を実行します。
   * 検索結果は最大MAX_RESULTS件まで表示します。
   *
   * @param value - 検索クエリ
   */
  const handleSearch = async (value: string) => {
    setQuery(value);

    if (!value) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // ビルド後に生成されるファイルを動的に読み込む
      // Pagefindはビルド後に生成されるため、開発時には存在しない
      // 型チェックを回避するため、importパスを動的に構築
      const pagefindPath = '/pagefind/pagefind.js';
      const pagefind: PagefindModule = await import(
        /* webpackIgnore: true */
        pagefindPath
      );
      const search = await pagefind.search(value);

      // 検索結果のデータを取得（最大MAX_RESULTS件）
      const data = await Promise.all(
        search.results
          .slice(0, SEARCH_CONSTANTS.MAX_RESULTS)
          .map((r: PagefindSearchResultItem) => r.data()),
      );

      // PagefindのURLを正しいNext.jsのルートに変換
      const normalizedData = data.map((result) => ({
        ...result,
        url: normalizePagefindUrl(result.url),
      }));

      setResults(normalizedData);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * 検索結果を選択したときの処理
   *
   * @param url - 遷移先のURL
   */
  const handleSelect = (url: string) => {
    router.push(url);
    onOpenChange(false);
    setQuery('');
    setResults([]);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder='記事を検索...'
        value={query}
        onValueChange={handleSearch}
      />
      <CommandList>
        <CommandEmpty>
          {isSearching ? '検索中...' : '記事が見つかりませんでした'}
        </CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading={`検索結果 (${results.length}件)`}>
            {results.map((result) => (
              <CommandItem
                key={result.url}
                value={result.url}
                onSelect={() => handleSelect(result.url)}
              >
                <div className='flex flex-col gap-1'>
                  <span className='font-medium'>{result.meta.title}</span>
                  {result.excerpt && (
                    <span
                      className='text-sm text-muted-foreground'
                      dangerouslySetInnerHTML={{ __html: result.excerpt }}
                    />
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
