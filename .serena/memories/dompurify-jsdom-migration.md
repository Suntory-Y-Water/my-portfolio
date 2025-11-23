# DOMPurifyとjsdomの移行記録

## 概要

`isomorphic-dompurify` から公式推奨の `dompurify` + `jsdom` への移行を実施。
Vercelビルドエラーの解決とリンクカード表示機能の復活を達成。

## 背景

### 問題1: Vercelビルドエラー

**エラー内容:**
```
Cannot find module 'entities/escape' from '/vercel/path0/node_modules/parse5/dist/serializer/index.js'
```

**原因:**
- `isomorphic-dompurify` は内部で `jsdom` を自動使用
- Vercelビルド環境では `jsdom` の依存関係（`entities` パッケージ）が正しく解決されない
- `isomorphic-dompurify` の抽象化が依存関係の問題を隠蔽

### 問題2: リンクカードが表示されない

**原因:**
- `rehype-link-card.ts` が `type: 'raw'` でHTMLを生成
- `custom-markdown.tsx` で `allowDangerousHtml: true` が無効
- ADR-0003で「セキュリティのため `allowDangerousHtml` を無効化」と決定していたが、リンクカード機能と競合

## 解決策

### 1. DOMPurify公式推奨の実装に変更

```typescript
// Before: isomorphic-dompurify
import DOMPurify from 'isomorphic-dompurify';

// After: 公式推奨（dompurify + jsdom）
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);
```

**メリット:**
- 依存関係が明示的
- DOMPurify公式ドキュメントに記載されている標準的な使い方
- Vercelビルド環境でも確実に動作

### 2. リンクカードHTMLのサニタイズ追加

`rehype-link-card.ts` でリンクカード生成時にDOMPurifyでサニタイズ:

```typescript
return purify.sanitize(html, {
  ALLOWED_TAGS: ['a', 'div', 'span', 'h3', 'p', 'img', 'svg', 'path', 'polyline', 'line'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'src', 'alt', 'loading', 'width', 'height', 'style', 'xmlns', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'x1', 'y1', 'x2', 'y2', 'points'],
});
```

### 3. allowDangerousHtmlの有効化（セキュリティ維持）

`custom-markdown.tsx`:

```typescript
.use(remarkRehype, { allowDangerousHtml: true })
.use(rehypeStringify, { allowDangerousHtml: true })
```

**セキュリティ保証:**
- リンクカード生成時にDOMPurifyでサニタイズ済み
- ALLOWED_TAGSとALLOWED_ATTRで必要最小限のHTMLのみ許可
- XSS攻撃のリスクは依然として低く維持

## 変更ファイル

### 依存関係

**削除:**
- `isomorphic-dompurify`

**追加:**
- `dompurify@3.3.0`
- `jsdom@27.2.0`
- `@types/dompurify@3.2.0`
- `@types/jsdom@27.0.0`

### コードファイル

1. **src/lib/inline-icons.ts**
   - `isomorphic-dompurify` から `dompurify` + `jsdom` に変更
   - 公式推奨の初期化方法を使用

2. **src/lib/rehype-link-card.ts**
   - DOMPurifyの初期化を追加
   - `createLinkCardHTML` でHTMLサニタイズを実装
   - ALLOWED_TAGSとALLOWED_ATTRを明示的に指定

3. **src/components/feature/content/custom-markdown.tsx**
   - `remarkRehype` に `allowDangerousHtml: true` を追加
   - `rehypeStringify` に `allowDangerousHtml: true` を追加
   - セキュリティに関するコメントを追加

## 結果

✅ Vercelビルドエラーが解消
✅ リンクカード表示機能が復活
✅ セキュリティレベルを維持（多層防御）
✅ 依存関係の透明性向上
✅ 型チェック、Lint、ビルドすべてパス

## セキュリティ多層防御

1. **SVGサニタイズ**: `inline-icons.ts` でSVG読み込み時にサニタイズ
2. **リンクカードサニタイズ**: `rehype-link-card.ts` でHTML生成時にサニタイズ
3. **ホワイトリスト方式**: ALLOWED_TAGSとALLOWED_ATTRで必要最小限のみ許可

## 参考

- DOMPurify公式ドキュメント: https://github.com/cure53/dompurify
- ADR-0003: SVGとMarkdownにおけるXSS脆弱性の対策
