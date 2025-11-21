---
title: Next.js App RouterとPagefindで爆速のサイト内検索を実装する
slug: nextjs-pagefind-implementation
date: 2025-11-21
modified_time: 2025-11-21
description: NotionベースからMarkdownベースに移行したブログに、Pagefindを使った高速なサイト内検索機能を実装した方法を紹介します
icon: 🔦
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Flashlight/Flat/flashlight_flat.svg
tags:
  - Next.js
  - Pagefind
  - React
---

## はじめに

ブログのアーキテクチャを Notion ベースから Markdown ベースのシンプルな構成へ移行し、記事数が 100 ページを超える規模に成長しました。
自分の過去記事を効率的に検索する必要性から、サイト内検索機能の実装を決定しました。

今回は、Pagefind という静的サイト向け検索ライブラリを使って、サーバーインフラなしで高速な全文検索を実現した方法を紹介します。

## Pagefindとは?

Pagefind は、静的サイトジェネレーター用の検索ライブラリです。
ビルド時に静的インデックスを作成し、クライアントサイドで検索を実行する仕組みとなっています。

SvelteKit などのドキュメントサイトでも採用されており、信頼性の高いライブラリです。
サーバーサイドの検索エンドポイントを用意する必要がなく、静的ホスティングだけで完結する点が大きな魅力です。

## セットアップとビルド設定

まず、`package.json` に以下のスクリプトを設定します。

```json
{
  "scripts": {
    "dev": "bun run --bun next dev",
    "build": "bun run --bun next build",
    "postbuild": "npx pagefind --site .next --output-path public/pagefind",
    "start": "next start"
  }
}
```

重要なのは `postbuild` フックです。
Next.js のビルド後に自動的に実行され、`.next` ディレクトリ内のビルド成果物をスキャンしてインデックスを生成します。

インデックスを `public/pagefind` に出力する理由は、Next.js の仕様を活用するためです。
`public` ディレクトリ配下に置いたファイルは静的アセットとして配信されるため、ブラウザから `/pagefind/pagefind.js` として直接アクセスできるようになります。

## 検索ダイアログの実装

検索機能を Cmd+K (Ctrl+K)で起動できるダイアログとして実装しました。
主要な機能は以下の通りです。

### キーボードショートカット対応

```typescript
export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [pagefindLoaded, setPagefindLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cmd+K/Ctrl+K でダイアログを開く
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onOpenChange(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  // Escape キーでダイアログを閉じる
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  // ... 省略
}
```

### PagefindUIの動的ロード

Pagefind のライブラリは、webpack によるバンドルを避けるために動的にロードします。

```typescript
useEffect(() => {
  if (!open || pagefindLoaded) return;

  // CSSの読み込み
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/pagefind/pagefind-ui.css';
  document.head.appendChild(link);

  // JavaScriptの動的インポート
  // webpackIgnore コメントでバンドル対象から除外
  import(/* webpackIgnore: true */ '/pagefind/pagefind-ui.js')
    .then(() => {
      setPagefindLoaded(true);
    })
    .catch((error) => {
      console.error('Pagefind loading error:', error);
    });
}, [open, pagefindLoaded]);
```

`/* webpackIgnore: true */` コメントは重要です。
これにより、webpack がバンドル時にこのファイルを処理しようとするのを防ぎます。

### 日本語UI対応とインスタンス初期化

```typescript
useEffect(() => {
  if (!pagefindLoaded || !mounted || !open) return;

  const container = document.getElementById('pagefind-container');
  if (!container) return;

  const pagefind = new window.PagefindUI({
    element: '#pagefind-container',
    showSubResults: true,
    translations: {
      placeholder: '検索...',
      clear_search: 'クリア',
      load_more: 'もっと見る',
      search_label: '検索',
      filters_label: 'フィルター',
      zero_results: '検索結果が見つかりませんでした',
    },
    processResult: (result: PagefindResult) => {
      result.url = normalizePagefindUrl(result.url);
      return result;
    },
  });

  return () => {
    if (container) {
      container.innerHTML = '';
    }
  };
}, [pagefindLoaded, mounted, open]);
```

`translations` オプションで日本語のラベルを設定し、`processResult` で URL 正規化を行います。

### React Portalの活用

ダイアログは React Portal を使って `document.body` に直接レンダリングします。

```typescript
return createPortal(
  <div className={open ? '' : 'hidden'}>
    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => onOpenChange(false)} />
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div id="pagefind-container" />
      </div>
    </div>
  </div>,
  document.body
);
```

これにより、PagefindUI インスタンスが不要にアンマウントされるのを防ぎ、表示/非表示は CSS の `hidden` クラスで制御します。

## URL正規化の実装

Pagefind は `.next` ディレクトリ内の成果物をスキャンするため、返される URL が内部パス形式になります。
これをユーザーがアクセス可能なパスに変換します。

```typescript
function normalizePagefindUrl(pagefindUrl: string): string {
  return pagefindUrl
    .replace(/^\/server\/app\//, '/') // /server/app/ を削除
    .replace(/\.html$/, ''); // .html を削除
}
```

例えば、`/server/app/blog/post-1.html` というパスを `/blog/post-1` に変換します。
この関数を `processResult` オプションで適用することで、検索結果のリンクが正しく機能します。

## ノイズ除去の実装

検索結果に不要なコンテンツが含まれないよう、`data-pagefind-ignore` 属性を使用します。

```tsx
<div data-pagefind-ignore>
  <h1>私について</h1>
  <h2>スイ</h2>
  <p>東京都で活動するエンジニア...</p>
</div>
```

この設定により、トップページのプロフィール情報などが検索インデックスから除外され、記事コンテンツのみが検索対象となります。

## まとめ

Next.js App Router と Pagefind を組み合わせることで、以下の実装ポイントを押さえた高速な検索機能を実現できました。

- `webpackIgnore` を使った動的スクリプト読み込み
- `public` ディレクトリ経由での静的アセット配信
- 内部パスを正規化して正しい URL に変換

サーバーなどの追加インフラなしで、ここまでの爆速検索が実装できるのは感動的です。
Markdown ベースのブログを運営している方は、ぜひ Pagefind を試してみてください。

## 参考資料

- [App Router で Pagefind を使う](https://www.mh4gf.dev/articles/app-router-pagefind)
- [静的サイト検索エンジンPagefindとUIライブラリの実装](https://azukiazusa.dev/blog/pagefind-static-site-search/)
- [Next.js search with Pagefind](https://www.petemillspaugh.com/nextjs-search-with-pagefind)
