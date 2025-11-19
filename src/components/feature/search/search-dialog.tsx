'use client';

import { useEffect } from 'react';
import { SEARCH_CONSTANTS } from '@/constants';

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
 * PagefindUIを使用したブログ記事の検索機能を提供します。
 * Cmd+K (Mac) / Ctrl+K (Windows) でダイアログを開くことができます。
 *
 * PagefindUIの公式コンポーネントを使用することで、
 * 日本語検索とUI文字列の完全な日本語化を実現しています。
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
   * PagefindUIの初期化
   *
   * ダイアログが開いたときにPagefindUIを動的にロードして初期化します。
   * translationsオプションで日本語UIを実現しています。
   * processResultでURLを正規化して正しいNext.jsルートに変換します。
   */
  useEffect(() => {
    if (!open) return;

    // PagefindUIのCSS/JSが既にロードされているかチェック
    const cssLoaded = !!document.querySelector('link[href*="pagefind-ui.css"]');
    const jsLoaded = !!document.querySelector('script[src*="pagefind-ui.js"]');

    // CSSをロード
    if (!cssLoaded) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/pagefind/pagefind-ui.css';
      document.head.appendChild(link);
    }

    // JSをロードして初期化
    const timer = setTimeout(() => {
      const searchElement = document.querySelector('#search');
      if (!searchElement) return;

      // 既存のコンテンツをクリア
      searchElement.innerHTML = '';

      const initPagefindUI = () => {
        const PagefindUIConstructor = (
          window as { PagefindUI?: PagefindUIInterface }
        ).PagefindUI;
        if (!PagefindUIConstructor) return;

        new PagefindUIConstructor({
          element: '#search',
          bundlePath: '/pagefind/',
          showSubResults: true,
          translations: {
            placeholder: '記事を検索...',
            clear_search: 'クリア',
            load_more: 'さらに読み込む',
            search_label: '検索',
            filters_label: 'フィルター',
            zero_results:
              '[SEARCH_TERM] に一致する記事は見つかりませんでした。',
            many_results: '[SEARCH_TERM] の検索結果（[COUNT] 件）',
            one_result: '[SEARCH_TERM] の検索結果（[COUNT] 件）',
            alt_search: '[SEARCH_TERM] の検索結果',
            search_suggestion:
              '検索結果が見つかりませんでした。別のキーワードをお試しください。',
            searching: '検索中...',
          },
          processResult: (result: {
            url: string;
            meta: { image?: string };
          }) => {
            result.url = normalizePagefindUrl(result.url);
            if (result.meta.image) {
              result.meta.image = result.meta.image.replaceAll('&amp;', '&');
            }
            return result;
          },
        });

        setTimeout(() => {
          document
            .querySelector<HTMLElement>('.pagefind-ui__search-input')
            ?.focus();
        }, 50);
      };

      if (jsLoaded) {
        // 既にロード済み
        initPagefindUI();
      } else {
        // JSをロード
        const script = document.createElement('script');
        script.src = '/pagefind/pagefind-ui.js';
        script.onload = initPagefindUI;
        document.head.appendChild(script);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [open]);

  /**
   * リンククリック時にダイアログを閉じる
   */
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        onOpenChange(false);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <>
      {/* オーバーレイ */}
      <button
        type='button'
        className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm'
        onClick={() => onOpenChange(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onOpenChange(false);
          }
        }}
        aria-label='検索ダイアログを閉じる'
      />

      {/* ダイアログコンテンツ */}
      <div className='fixed left-0 right-0 top-0 z-50 mx-auto mt-8 flex max-h-[90%] min-h-[15rem] max-w-2xl overflow-y-auto rounded-lg border border-border bg-background p-5 text-foreground shadow-lg md:mt-16 md:max-h-[80%]'>
        <div id='search' className='w-full' />
      </div>
    </>
  );
}
