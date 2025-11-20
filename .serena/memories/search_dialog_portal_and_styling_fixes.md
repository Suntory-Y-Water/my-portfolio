# 検索ダイアログのPortal化とスタイル修正

## 実施日
2025-11-20

## 概要
検索ダイアログのオーバーレイが全画面に表示されない問題、Escキーで閉じない問題、ダークモードの視認性問題を修正しました。

## 発生していた問題

### 1. オーバーレイが全画面に表示されない（深刻）
- **症状**: オーバーレイがヘッダー部分（高さ64px）のみに表示され、コンテンツエリアは暗くならない
- **原因**: 検索ダイアログがヘッダー要素（`<header>`）の子要素としてレンダリングされており、ヘッダーが`sticky`で`height: 64px`に制限されていたため、オーバーレイもその高さに制限されていた
- **調査方法**: DevTools MCPで`evaluate_script`を使用してオーバーレイ要素のスタイルを調査し、`height: 63px`であることを発見

### 2. 枠外タップやEscapeキーで閉じない（深刻）
- **症状**: オーバーレイをクリックしてもダイアログが閉じない、Escapeキーも反応しない
- **原因**: 
  - オーバーレイのクリックイベント: ヘッダーに制限されているため、コンテンツエリアのオーバーレイをクリックできない
  - Escapeキー: イベントハンドラーが実装されていなかった

### 3. ダークモードでの文字色の視認性が悪い
- **症状**: 検索結果のタイトルと本文が薄いグレー（`rgb(57, 57, 57)`）で、黒背景で見づらい
- **原因**: PagefindUIのデフォルトスタイルがダークモードに対応していない
- **調査方法**: DevTools MCPで`evaluate_script`を使用して各要素の`computedStyle`を確認

## 解決方法

### 1. React Portalを使用したオーバーレイの修正

#### 変更ファイル
- `src/components/feature/search/search-dialog.tsx`

#### 変更内容
```typescript
// Before
import { useEffect } from 'react';

return (
  <>
    <button className='fixed inset-0 z-40 bg-black/80 backdrop-blur-sm' />
    <div className='fixed left-0 right-0 top-0 z-50 ...'>
      <div id='search' className='w-full' />
    </div>
  </>
);
```

```typescript
// After
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

return createPortal(
  <>
    <button className='fixed inset-0 z-40 bg-black/80 backdrop-blur-sm' />
    <div className='fixed left-0 right-0 top-0 z-50 ...'>
      <div id='search' className='w-full' />
    </div>
  </>,
  document.body,
);
```

#### 重要なポイント
- `ReactDOM.createPortal`ではなく、`createPortal`を`react-dom`から直接インポート
- ヘッダーの子要素ではなく、`document.body`に直接レンダリングすることで、ヘッダーの高さ制限を回避
- z-index: オーバーレイ `z-40`、ダイアログコンテンツ `z-50`、ヘッダー `z-30`

### 2. Escapeキーで閉じる機能の追加

#### 変更内容
```typescript
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
```

### 3. ダークモードのスタイル改善

#### 変更ファイル
- `src/styles/globals.css`

#### 重要な発見
- **@layerを使わない**: PagefindUIは動的にDOMに追加されるため、`@layer components`ではなくグローバルスコープで定義する必要がある
- **CSS変数は不要**: Tailwindの`darkMode: ['class']`設定があるため、`.dark`クラスで直接スタイルを定義できる
- **不要なCSS変数を削除**: `--pagefind-ui-*`の変数は使用していないため削除

#### ライトモード用スタイル
```css
/* タイトル */
.pagefind-ui__result-title,
.pagefind-ui__result-link {
  color: hsl(0 0% 5%) !important;
}

/* 本文 */
.pagefind-ui__result-excerpt {
  color: hsl(0 0% 20%) !important;
}

/* ハイライト */
mark {
  background-color: hsl(60 100% 70%) !important;
  color: hsl(0 0% 0%) !important;
}

/* クリアボタン */
.pagefind-ui__search-clear {
  color: hsl(0 0% 40%) !important;
}

/* ボタンの余白 */
.pagefind-ui__button {
  margin-bottom: 1rem !important;
}
```

#### ダークモード用スタイル
```css
/* タイトル - 明るい白 */
.dark .pagefind-ui__result-title,
.dark .pagefind-ui__result-link {
  color: hsl(0 0% 95%) !important;
}

/* 本文 - やや明るいグレー */
.dark .pagefind-ui__result-excerpt {
  color: hsl(0 0% 80%) !important;
}

/* ハイライト - オレンジ背景 + 白文字 */
.dark mark {
  background-color: hsl(45 100% 40%) !important;
  color: hsl(0 0% 100%) !important;
}

/* クリアボタン - グレー */
.dark .pagefind-ui__search-clear {
  color: hsl(0 0% 60%) !important;
}
```

## 手こずった点

### 1. オーバーレイの高さ制限の原因特定
- **問題**: スタイルは正しく設定されているのに、オーバーレイが全画面に表示されない
- **解決**: DevTools MCPで`evaluate_script`を使用してDOM構造を調査し、オーバーレイがヘッダーの子要素であることを発見
- **学び**: `fixed`ポジションでも、親要素の高さ制限を受ける場合がある

### 2. Serena MCPでのシンボル編集エラー
- **問題**: `replace_symbol_body`で`name_path_pattern`を使用してエラー
- **解決**: 正しいパラメータ名は`name_path`（`pattern`ではない）
- **学び**: Serena MCPのツールは正確なパラメータ名を要求する

### 3. CSS変数とTailwindの統合
- **問題**: CSS変数を定義しても、PagefindUIに適用されない
- **解決**: CSS変数を使わず、直接HSL値を指定し、`@layer`を削除してグローバルスコープで定義
- **学び**: 動的に生成される要素には、グローバルスコープでスタイルを定義する必要がある

### 4. ファイル編集時の重複コード
- **問題**: `replace_symbol_body`実行後、ファイルに古いコードの断片が残った
- **解決**: ファイル全体を読み直して、重複部分を手動で削除
- **学び**: Editツールでの編集は、前後の内容を正確に指定する必要がある

## 動作確認済み項目

### ライトモード
- ✅ オーバーレイが全画面に表示される
- ✅ 枠外タップでダイアログが閉じる
- ✅ Escapeキーでダイアログが閉じる
- ✅ 検索結果の文字色が読みやすい（黒文字）
- ✅ ハイライト（黄色背景）が読みやすい（黒文字）
- ✅ クリアボタンの色が適切（グレー）
- ✅ 「さらに読み込む」ボタンの下部に余白がある

### ダークモード
- ✅ オーバーレイが全画面に表示される
- ✅ 枠外タップでダイアログが閉じる
- ✅ Escapeキーでダイアログが閉じる
- ✅ 検索結果のタイトルが読みやすい（明るい白）
- ✅ 検索結果の本文が読みやすい（明るいグレー）
- ✅ ハイライト（オレンジ背景）が読みやすい（白文字）
- ✅ クリアボタンの色が適切（グレー）
- ✅ 「さらに読み込む」ボタンの下部に余白がある

## 技術的な学び

### React Portal
- Portalは、親コンポーネントのDOM階層外にコンポーネントをレンダリングする際に使用
- モーダル、オーバーレイ、ツールチップなど、z-indexや親要素の制限を回避したい場合に有効
- `createPortal(children, domNode)`の形式で使用

### Tailwind + CSS
- Tailwindの`darkMode: ['class']`設定がある場合、`.dark`クラスで直接ダークモード用のスタイルを定義できる
- `@layer`は静的なスタイルに有効だが、動的に生成される要素にはグローバルスコープで定義する必要がある
- `!important`を使用してサードパーティライブラリのスタイルを上書きする場合は、優先度に注意

### PagefindUI
- PagefindUIは動的にDOMを生成するため、CSSは慎重に設計する必要がある
- デフォルトのスタイルは上書きしにくいため、`!important`が必要な場合が多い
- クラス名: `.pagefind-ui__*`のパターンでスタイルを上書き可能

## 関連ファイル
- `src/components/feature/search/search-dialog.tsx`
- `src/styles/globals.css`
- `src/components/shared/Header.tsx` (検索ダイアログの呼び出し元)

## 今後の改善案
- ライトモード/ダークモードの切り替えアニメーションを追加
- 検索結果のハイライト色をテーマカラーに統一
- モバイル表示での最適化（現在も動作しているが、さらに改善の余地あり）
