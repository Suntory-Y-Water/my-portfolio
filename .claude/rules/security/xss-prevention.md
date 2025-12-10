---
paths: "{src/lib,src/actions}/**/*.ts"
---

# セキュリティ原則

## 外部入力の扱い

### 必須対応
- ユーザー入力・外部APIからのデータは必ずサニタイズ
- `src/lib/sanitize.ts` の既存関数を使用
- 独自実装禁止

### URL検証
```typescript
// ✅ Good - プロトコル検証
if (!url.startsWith('https://')) {
  throw new Error('Invalid URL protocol');
}

// ❌ Bad - 検証なし
const response = await fetch(url);
```

## 禁止事項

- `dangerouslySetInnerHTML` の直接使用
- `eval()`, `Function()` の使用
- URL検証なしの外部リソース取得
- スクリプトタグ・イベントハンドラの動的生成

## 実装済みセキュリティ機能

プロジェクトには以下のセキュリティ対策が実装済み:
- DOMPurify + jsdom によるHTMLサニタイズ
- SVGセキュリティチェック (pre-commit hook)
- CSP, セキュリティヘッダー設定

**新規実装時は既存の `src/lib/sanitize.ts` パターンに従う。**

## 参考
- 実装例: `src/lib/sanitize.ts`
- ADR: `docs/adr/decisions/adr-0003.json`, `adr-0004.json`
