# Pagefind Dynamic Import実装の記録

## 概要

検索ダイアログコンポーネント（`src/components/feature/search/search-dialog.tsx`）を公式推奨のdynamic importアプローチでリファクタリングした際の実装メモ。

## 実装の背景

- **元の実装**: `<script>`タグを動的に追加してPagefindをロード
- **新しい実装**: dynamic import + webpackIgnoreを使用（公式推奨）
- **目的**: よりシンプルで保守性の高い実装に改善

## 実装時の課題と解決策

### 1. 型定義の問題

#### 課題
PagefindUIの公式型定義は提供されていないため、TypeScriptで型エラーが発生。

#### 解決策
`src/types/global.d.ts`に以下の型定義を追加：

1. **PagefindUIInterfaceの定義**
   - 公式ドキュメントを基に独自に型定義を作成
   - コンストラクタオプション、メソッドの型を定義

2. **動的インポートのモジュール宣言**
   ```typescript
   declare module '/pagefind/*' {
     export const PagefindUI: PagefindUIInterface;
   }
   ```
   - webpackIgnoreを使った絶対パスimportに対応
   - ワイルドカード（`*`）で全てのpagefindファイルをカバー

3. **Window型の拡張**
   ```typescript
   interface Window {
     PagefindUI?: PagefindUIInterface;
   }
   ```
   - PagefindUIはグローバルに`window`オブジェクトに登録される
   - `window.PagefindUI`に型安全にアクセスできるように

### 2. @ts-expect-errorの使用問題

#### 課題
当初`@ts-expect-error`を使用したが、ビルド時に「Unused '@ts-expect-error' directive」エラーが発生。

#### 試行錯誤
1. `@ts-ignore`に変更 → Lintエラー（Biomeが推奨しない）
2. `@ts-expect-error`を削除してcatch句で対応 → 型エラーが発生
3. 型定義をglobal.d.tsに追加 → **解決**

#### 最終的な解決策
型定義を追加することで、`@ts-expect-error`や`@ts-ignore`を使わずに型安全な実装を実現。

### 3. CSSの動的ロード

#### 課題
JSだけをdynamic importで読み込んだため、UIが壊れる問題が発生。

#### 解決策
CSSも動的に`<link>`タグで読み込むように実装：

```typescript
// CSSを読み込み（既に読み込まれていない場合のみ）
if (!document.querySelector('link[href="/pagefind/pagefind-ui.css"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/pagefind/pagefind-ui.css';
  document.head.appendChild(link);
}
```

**重要**: CSSのロード完了を待たずにJSを実行すると、スタイルが適用されない可能性がある。

### 4. window.PagefindUIへのアクセス

#### 実装方法
PagefindUIはdynamic importで読み込むと、グローバルに`window`オブジェクトに登録される：

```typescript
// JSを動的にロード
await import(/* webpackIgnore: true */ '/pagefind/pagefind-ui.js');

// PagefindUIはグローバルに登録されるため、windowから取得
if (!window.PagefindUI) {
  console.warn('PagefindUI not found in window object');
  return;
}

// インスタンス生成
new window.PagefindUI({
  element: '#search',
  bundlePath: '/pagefind/',
  // ...
});
```

## 最終的な実装パターン

```typescript
useEffect(() => {
  async function loadPagefind() {
    if (pagefindLoaded) return;

    try {
      // 1. CSSを動的にロード
      if (!document.querySelector('link[href="/pagefind/pagefind-ui.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/pagefind/pagefind-ui.css';
        document.head.appendChild(link);
      }

      // 2. JSを動的にロード（webpackIgnoreでバンドル回避）
      await import(/* webpackIgnore: true */ '/pagefind/pagefind-ui.js');

      // 3. グローバルに登録されたPagefindUIを取得
      if (!window.PagefindUI) {
        console.warn('PagefindUI not found in window object');
        return;
      }

      // 4. インスタンス生成
      new window.PagefindUI({
        element: '#search',
        bundlePath: '/pagefind/',
        // 既存の設定（日本語UI、URL正規化など）を維持
      });

      setPagefindLoaded(true);
    } catch (error) {
      // 開発環境ではPagefindがまだ生成されていない可能性
      console.warn('Pagefind not available:', error);
    }
  }

  if (open && !pagefindLoaded) {
    loadPagefind();
  }
}, [open, pagefindLoaded]);
```

## 学んだこと

1. **型定義がない場合の対処**
   - 公式の型定義がない場合、ドキュメントを基に独自に定義する
   - `declare module`と`interface Window`を活用

2. **webpackIgnoreの重要性**
   - Next.jsのビルド時にバンドルされないよう、`/* webpackIgnore: true */`が必須
   - これにより、ビルド後のpublicフォルダ内のファイルを正しく参照できる

3. **グローバル変数へのアクセス**
   - PagefindUIはESモジュールではなく、グローバルスコープに登録される
   - `window.PagefindUI`としてアクセスする必要がある

4. **CSSとJSの読み込み順序**
   - CSSを先に読み込むことで、UIが壊れるのを防ぐ
   - ただし、完全な解決にはCSSのロード完了を待つ処理も検討の余地あり

## 関連ファイル

- `src/components/feature/search/search-dialog.tsx` - メインの実装
- `src/types/global.d.ts` - 型定義
- `.serena/memories/2025-11-20_参考.md` - 参考資料（公式ドキュメント）

## 今後の改善点

- CSSのロード完了を確実に待つ処理の追加を検討
- 開発環境でのエラーハンドリングのさらなる改善
