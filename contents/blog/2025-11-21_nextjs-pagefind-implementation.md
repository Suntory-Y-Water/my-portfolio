---
title: Next.js App RouterとPagefindで爆速のサイト内検索を実装する
slug: nextjs-pagefind-implementation
date: 2025-11-21
modified_time: 2025-11-21
description: Next.js App RouterのブログにPagefindを導入し、全文検索機能を実装しました。Bun環境でのビルド設定や、React Portalを使用したダイアログの実装、URL正規化のテクニックについて解説します。
icon: 🔦
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Flashlight/Flat/flashlight_flat.svg
tags:
  - Next.js
  - Pagefind
  - React
---

## はじめに

最近、ブログのアーキテクチャを Notion ベースの動的な仕組みから、Markdown ベースのシンプルな構成へ移行しました。
それに伴い、過去の記事をすべてこのブログに集約した結果、記事数は 100 ページを超える規模になりました。

正直なところ、自分で過去の記事を読み返すことはあまりないのですが、今後も知見を書き溜めていく上で「あれ、これ前にも書いたっけ？」となる瞬間が増えることが予想されます。
そこで、ブログ内を横断的に検索できる機能を実装することにしました。

調査を進めると、ビルド時に静的インデックスを作成し、クライアントサイドで検索を実行する**Pagefind**というライブラリが非常に優秀であることが分かりました。
SvelteKit などのドキュメントサイトや、多くの技術ブログで採用されており、静的サイトにおける検索ソリューションとして信頼性が高いです。

https://pagefind.app/

今回は、Next.js (App Router) 環境に Pagefind を導入する手順と、実装時の具体的なコードを紹介します。

## セットアップとビルド設定

Pagefind は、静的サイトジェネレーター（SSG）で生成された HTML ファイルを解析し、検索用インデックスを作成します。
今回はランタイムに **Bun** を使用しているため、`package.json` のスクリプトは以下のようになります。

```json package.json
{
  "scripts": {
    "dev": "bun run --bun next dev",
    "build": "bun run --bun next build",
    "postbuild": "npx pagefind --site .next --output-path public/pagefind",
    "start": "next start"
  }
}
```

### なぜ public ディレクトリに出力するのか?

上記のコマンドでは、`postbuild` フックを使って Next.js のビルド成果物（`.next`）をスキャンし、インデックスの出力先（`--output-path`）を `public/pagefind` に指定しています。

通常、静的サイトジェネレーターであればビルド成果物の中に含めてしまえば良いのですが、Next.js の場合、**`public` ディレクトリ配下に置いたファイルが静的アセットとして配信される**という仕様があります。
ここにインデックスファイルや `pagefind.js` を出力することで、ブラウザ（クライアントサイド）から `/pagefind/pagefind.js` として直接アクセスが可能になり、スムーズに検索スクリプトをロードできるようになります。

## 検索ダイアログの実装

今回は `shadcn/ui` などのコンポーネントと組み合わせて、Cmd+K で起動するモーダルダイアログを作成しました。
Pagefind のデフォルト UI を React 内で安全に呼び出すための実装コードがこちらです。

```ts src/components/search-dialog.tsx
'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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
 * 公式の推奨アプローチに基づき、dynamic importとwebpackIgnoreを使用して実装しています。
 * これにより、開発環境でのエラーハンドリングとビルド後の正しいパス解決を実現しています。
 *
 * @param open - ダイアログの開閉状態
 * @param onOpenChange - ダイアログの開閉状態を変更する関数
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <SearchDialog open={open} onOpenChange={setOpen} />
 * ```
 *
 * @see https://pagefind.app/docs/ui/
 * @see https://www.petemillspaugh.com/using-pagefind-with-nextjs
 */
export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [pagefindLoaded, setPagefindLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // クライアントマウント完了フラグ
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Cmd+K / Ctrl+K でダイアログを開く
   *
   * 外部システム(ブラウザのキーボードイベント)との同期のため、useEffectを使用。
   * onOpenChangeに関数形式を使うことで、openを依存配列から除外し、
   * openが変わるたびにイベントリスナーが再登録されるのを防ぐ。
   */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        e.key === SEARCH_CONSTANTS.KEYBOARD_SHORTCUT.key &&
        (e.metaKey || e.ctrlKey)
      ) {
        e.preventDefault();
        onOpenChange((prev: boolean) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onOpenChange]);

  /**
   * Escapeキーでダイアログを閉じる
   *
   * ダイアログが開いているときのみEscapeキーのハンドラーを登録する。
   */
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  /**
   * PagefindUIのロードと初期化
   *
   * 公式推奨のアプローチに基づき、CSSとJSを動的にロード。
   * - CSSを<link>タグで読み込み
   * - JSをdynamic importで読み込み（webpackIgnoreでパスを維持）
   * - try-catchで開発環境のエラーハンドリング
   * - translationsオプションで日本語UIを実現
   * - processResultでURLを正規化
   */
  useEffect(() => {
    async function loadPagefind() {
      if (pagefindLoaded) return;

      try {
        // CSSを読み込み（既に読み込まれていない場合のみ）
        if (!document.querySelector('link[href="/pagefind/pagefind-ui.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = '/pagefind/pagefind-ui.css';
          document.head.appendChild(link);
        }

        // JSを動的にロード
        await import(/* webpackIgnore: true */ '/pagefind/pagefind-ui.js');

        // PagefindUIはグローバルに登録されるため、windowオブジェクトから取得
        if (!window.PagefindUI) {
          console.warn('PagefindUI not found in window object');
          return;
        }

        // PagefindUI インスタンスを生成
        new window.PagefindUI({
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
            many_results: '[SEARCH_TERM] の検索結果([COUNT] 件)',
            one_result: '[SEARCH_TERM] の検索結果([COUNT] 件)',
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

        setPagefindLoaded(true);
      } catch (error) {
        // 開発環境ではPagefindがまだ生成されていない可能性がある
        console.warn('Pagefind not available:', error);
      }
    }

    if (open && !pagefindLoaded) {
      loadPagefind();
    }
  }, [open, pagefindLoaded]);

  /**
   * ダイアログが開くたびに検索入力にフォーカス
   *
   * 外部システム(ブラウザのDOM API)との同期のため、useEffectを使用。
   * PagefindUIが生成するDOMに対してフォーカスを当てる。
   */
  useEffect(() => {
    if (!open || !pagefindLoaded) return;

    const timer = setTimeout(() => {
      document
        .querySelector<HTMLElement>('.pagefind-ui__search-input')
        ?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [open, pagefindLoaded]);

  /**
   * リンククリック時にダイアログを閉じる
   *
   * 外部システム(DOMのクリックイベント)との同期のため、useEffectを使用。
   * ダイアログが開いているときのみイベントリスナーを登録する。
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

  // サーバー側では document が無いため、マウント前は何も描画しない
  if (!mounted) {
    return null;
  }

  // React Portalを使用してdocument.bodyに直接レンダリング
  // ダイアログを閉じてもアンマウントせず、CSSで非表示にする（PagefindUIのDOMを保持するため）
  return createPortal(
    <div className={open ? '' : 'hidden'}>
      {/* オーバーレイ */}
      <button
        type='button'
        className='fixed inset-0 z-40 bg-black/80 backdrop-blur-sm'
        onClick={() => onOpenChange(false)}
        aria-label='検索ダイアログを閉じる'
        tabIndex={-1}
      />

      {/* ダイアログコンテンツ */}
      <div className='fixed left-0 right-0 top-0 z-50 mx-auto mt-8 flex max-h-[85vh] min-h-[20rem] max-w-4xl overflow-y-auto rounded-lg border border-border bg-background p-6 pb-8 text-foreground shadow-lg md:mt-16 md:max-h-[75vh]'>
        <div id='search' ref={searchContainerRef} className='w-full' />
      </div>
    </div>,
    document.body,
  );
}
```

## 実装のポイントと工夫

### webpackIgnore と Dynamic Import

Next.js (webpack) の環境では、ビルド時に存在しないファイルを import しようとするとエラーになります。
Pagefind のスクリプトは `postbuild` で生成されるため、`/* webpackIgnore: true */` を指定して webpack のバンドル対象から外し、ブラウザランタイムで直接 `public` ディレクトリから読み込むようにしています。

### URLの正規化処理

Pagefind は `.next` ディレクトリ内の成果物をスキャンするため、検索結果の URL が `/server/app/blog/post-1.html` のような内部パスで返ってくることがあります。
これをユーザーがアクセス可能な `/blog/post-1` に変換するために、`processResult` オプション内で `normalizePagefindUrl` 関数を実行しています。

### React Portal の活用

検索ダイアログは z-index やスタッキングコンテキストの影響を受けやすいため、`createPortal` を使用して `document.body` 直下にレンダリングしています。
また、ダイアログを閉じた際にコンポーネントをアンマウントしてしまうと、Pagefind UI のインスタンスや検索状態が破棄されてしまうため、CSS の `hidden` クラス切り替えで表示制御を行っているのもポイントです。

## 検索ノイズの除去

ブログ全体を検索対象にしたい一方で、トップページにある「自己紹介」などが検索結果に出てくるとノイズになります。
Pagefind は `data-pagefind-ignore` 属性を付与することで、特定の要素をインデックス対象から除外できます。

```tsx src/app/page.tsx
<div data-pagefind-ignore>
  <h1 className='pb-6 text-4xl font-semibold tracking-wide md:text-[40px]'>
    私について
  </h1>
  <div className='mt-4 space-y-1'>
    <h2 className='text-2xl font-semibold'>スイ</h2>
    <p>
      東京都で活動するエンジニア。名前の由来は、目の前にあったサントリーの天然水から命名しています。
    </p>
    <p>健康第一をモットーにしており、一年以上ほぼ毎日朝活🌅しています。</p>
  </div>
</div>
```

この設定を入れておくことで、自己紹介文に含まれる単語で検索しても、記事以外のコンテンツがヒットするのを防ぐことができます。

## まとめ

Next.js App Router と Pagefind の組み合わせは、以下の点さえ気をつければ非常に強力な検索ソリューションになります。

- `webpackIgnore` を使って動的にスクリプトを読み込む
- `public` ディレクトリ経由で静的アセットとして配信する
- 内部パスを正規化して正しい URL に変換する

サーバー等の追加インフラなしで、ここまでの爆速検索が実装できるのは感動的です。
ブログなどの静的サイトを作っている方は、ぜひ導入を検討してみてください。

以上になります。

## 参考記事

- [App Router で Pagefind を使う | mh4gf.dev](https://mh4gf.dev/articles/pagefind-with-app-router)
- [静的サイト検索エンジンPagefindとUIライブラリを使ってサイト内検索を実装する](https://azukiazusa.dev/blog/static-site-search-engine-and-ui-library-pagefind/)
- [Next.js search with Pagefind](https://www.petemillspaugh.com/nextjs-search-with-pagefind)
