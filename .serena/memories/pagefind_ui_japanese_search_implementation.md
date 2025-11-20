# PagefindUIによる日本語検索機能の実装

**日付**: 2025-11-20
**関連Issue**: #248

---

## 課題

### 初期の問題
- shadcn/ui Command + Pagefind APIでは日本語検索が動作しない
- 「今日」などの日本語キーワードで検索してもUIに結果が表示されない
- Pagefind自体は日本語を認識（DevToolsで`pagefind.search('今日')`を実行すると16件ヒット）

### 根本原因
PagefindのJavaScript APIは日本語検索をサポートしているが、shadcn/ui Commandと組み合わせた場合、UI側で結果が正しく処理されない問題があった。

---

## 実施した解決策

### アプローチ: PagefindUIへの完全移行

shadcn/ui CommandベースからPagefindUI公式コンポーネントへ移行することで、日本語検索とUI文字列の完全な日本語化を実現。

---

## 実装内容

### 1. 変更ファイル

#### `src/components/feature/search/search-dialog.tsx`
- **変更前**: shadcn/ui Command + Pagefind JavaScript API
- **変更後**: PagefindUI公式コンポーネント + 動的スクリプトロード

#### `src/styles/globals.css`
- PagefindUI用のCSS変数を追加（ライトモード・ダークモード対応）

### 2. 実装の詳細

#### PagefindUIの動的ロード
```typescript
// /pagefind/pagefind-ui.jsを動的にロード
const script = document.createElement('script');
script.src = '/pagefind/pagefind-ui.js';
script.onload = () => {
  const PagefindUIConstructor = window.PagefindUI;
  new PagefindUIConstructor({
    element: '#search',
    bundlePath: '/pagefind/',
    showSubResults: true,
    translations: { /* 日本語UI文字列 */ },
    processResult: (result) => {
      // URL正規化とメタデータ処理
    }
  });
};
document.head.appendChild(script);
```

**重要ポイント**:
- `@pagefind/default-ui`からの`import`ではなく、生成された`/pagefind/pagefind-ui.js`を直接ロード
- `window.PagefindUI`経由でグローバルコンストラクタにアクセス

#### translations設定（日本語UI）
```typescript
translations: {
  placeholder: '記事を検索...',
  clear_search: 'クリア',
  load_more: 'さらに読み込む',
  search_label: '検索',
  filters_label: 'フィルター',
  zero_results: '[SEARCH_TERM] に一致する記事は見つかりませんでした。',
  many_results: '[SEARCH_TERM] の検索結果（[COUNT] 件）',
  one_result: '[SEARCH_TERM] の検索結果（[COUNT] 件）',
  alt_search: '[SEARCH_TERM] の検索結果',
  search_suggestion: '検索結果が見つかりませんでした。別のキーワードをお試しください。',
  searching: '検索中...',
}
```

#### URL正規化（既存の処理を維持）
```typescript
processResult: (result) => {
  // Pagefindが返す `/server/app/xxx.html` を `/xxx` に変換
  result.url = result.url
    .replace(/^\/server\/app\//, '/')
    .replace(/\.html$/, '');
  
  // 画像URLの &amp; を & に変換（Pagefind既知の問題）
  if (result.meta.image) {
    result.meta.image = result.meta.image.replaceAll('&amp;', '&');
  }
  return result;
}
```

#### CSS変数（テーマ統合）
```css
/* ライトモード */
:root {
  --pagefind-ui-primary: hsl(214 100% 27%); /* inori-track blue */
  --pagefind-ui-text: hsl(0 0% 20%);
  --pagefind-ui-background: hsl(0 0% 100%);
  --pagefind-ui-border: hsl(0 0% 86%);
  --pagefind-ui-tag: hsl(220 14% 96%);
}

/* ダークモード */
.dark {
  --pagefind-ui-primary: hsl(199 100% 78%); /* #8ED0FF */
  --pagefind-ui-text: hsl(0 0% 95%);
  --pagefind-ui-background: hsl(0 0% 15%);
  --pagefind-ui-border: hsl(0 0% 28%);
  --pagefind-ui-tag: hsl(0 0% 20%);
}
```

#### ダイアログ構造
shadcn/ui DialogコンポーネントではなくシンプルなHTML構造に変更：
```tsx
<>
  {/* オーバーレイ */}
  <button
    type='button'
    className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm'
    onClick={() => onOpenChange(false)}
    aria-label='検索ダイアログを閉じる'
  />
  
  {/* ダイアログコンテンツ */}
  <div className='fixed left-0 right-0 top-0 z-50 mx-auto mt-8 flex max-h-[90%] min-h-[15rem] max-w-2xl overflow-y-auto rounded-lg border border-border bg-background p-5 text-foreground shadow-lg md:mt-16 md:max-h-[80%]'>
    <div id='search' className='w-full' />
  </div>
</>
```

---

## 試したこと（失敗したアプローチ）

### 1. `@pagefind/default-ui`からの動的import
```typescript
// ❌ これは動作しなかった
const { PagefindUI } = await import('@pagefind/default-ui');
```
**問題**: Next.jsのバンドラーがPagefindUIを正しく処理できず、`Cannot read properties of undefined (reading 'options')`エラーが発生。

### 2. shadcn/ui Dialogコンポーネントの使用
```typescript
// ❌ レイアウトが崩れた
<Dialog>
  <DialogOverlay />
  <DialogContent>
    <div id='search' />
  </DialogContent>
</Dialog>
```
**問題**: PagefindUIが生成するDOMとshadcn/ui Dialogのスタイルが競合し、画面左上に見切れる。

---

## 現状

### ✅ 動作確認完了
- 日本語検索が正常に動作（「今日」で検索すると結果が表示される）
- UI文字列が完全に日本語化
- ライトモード・ダークモード対応
- URL正規化により正しいNext.jsルートに遷移
- Cmd+K / Ctrl+K ショートカット機能
- 検索結果のクリックでページ遷移

### 技術的な詳細
- **Pagefindバージョン**: 1.4.0
- **PagefindUIのロード方法**: 動的スクリプトロード（`/pagefind/pagefind-ui.js`）
- **型定義**: `src/types/global.d.ts`で`PagefindUIInterface`を定義済み
- **ビルドプロセス**: `postbuild`スクリプトで自動的にPagefindインデックスを生成

### 既知の制約事項
1. **開発環境では動作しない**: Pagefindインデックスは`postbuild`で生成されるため、`bun run dev`では検索機能が利用できない
2. **Pagefindは日本語のステミングをサポートしない**: 完全一致検索のみ（例：「開発」で「開発者」はヒットしない）

---

## 参考実装
- https://github.com/azukiazusa1/sapper-blog-app/blob/main/app/src/components/SearchDialog/SearchDialog.svelte
- PagefindUI公式ドキュメント: https://pagefind.app/docs/ui/

---

## ビルドコマンド
```bash
# 本番ビルド（Pagefindインデックス生成含む）
bun run build

# 本番サーバー起動
bun run start
```
