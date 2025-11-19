# Pagefind検索機能の実装問題

**日付**: 2025-11-19
**関連Issue**: #248

---

## 問題の概要

「今日」で検索してもブログ記事が0件ヒットする問題。

---

## 調査結果

### 1. Pagefind自体は正常に動作

DevToolsで確認した結果：
- `pagefind.search('今日')` → 16件ヒット
- pagefind.jsは正常にロード可能（fetch、dynamic importともに成功）

### 2. 検索結果のURLが間違っている

実際の検索結果:
```json
{
  "url": "/server/app/tags/firebase.html",
  "title": "Firebase タグの記事一覧"
}
```

期待されるURL:
```
/tags/firebase
```

**原因**: Pagefindが`.next/server/app/`のパスをそのままURLとして返している

### 3. 実装した修正

#### package.json
```json
"postbuild": "pagefind --site .next --output-path public/pagefind"
```

#### search-dialog.tsx
```typescript
// URL正規化関数を追加
function normalizePagefindUrl(pagefindUrl: string): string {
  return pagefindUrl
    .replace(/^\/server\/app\//, '/') // /server/app/ を削除
    .replace(/\.html$/, ''); // .html を削除
}

// 検索結果のURLを正規化
const normalizedData = data.map((result) => ({
  ...result,
  url: normalizePagefindUrl(result.url),
}));
```

#### import文にwebpackIgnore追加
```typescript
const pagefind: PagefindModule = await import(
  /* webpackIgnore: true */ '/pagefind/pagefind.js'
);
```

---

## 現在の問題

### TypeScriptビルドエラー

```
Type error: Cannot find module '/pagefind/pagefind.js' or its corresponding type declarations.
```

**原因**:
- pagefind.jsは`postbuild`で生成されるため、TypeScriptのコンパイル時には存在しない
- `src/types/pagefind.d.ts`で`declare module`を定義しているが、tscは実ファイルの存在を要求する
- `tsconfig.json`で`skipLibCheck: true`は設定済み

### 試したこと

1. ✅ `@ts-expect-error` → "Unused directive"エラー
2. ✅ `@ts-ignore` → 同じビルドエラー
3. ✅ `as unknown as PagefindModule` → フックでブロック（no_restricted_edit.ts）
4. ✅ `as string` → 試したが動作せず

---

## 参考記事の実装

### 記事1: https://mh4gf.dev/articles/pagefind-with-app-router
```json
"postbuild": "pagefind --site .next --output-path public/search"
```

### 記事2: https://liginc.co.jp/647675
- 同じURL問題を報告
- 「URLを再構築する必要がある」と記載

---

## 次のステップ（未実施）

1. **本番サーバーで実際に検索が動作するか確認**
   - `bun run start`で起動中
   - DevToolsで検索実行時に`MODULE_NOT_FOUND`エラー発生
   - しかし、手動でimportすると成功している

2. **型定義ファイルの修正を試す**
   - `declare module`の書き方を変更
   - または型定義を削除してJavaScriptとして扱う

3. **開発環境でのエラーハンドリング**
   - pagefind.jsが存在しない場合のフォールバック処理

---

## 補足情報

### ビルド結果
```
Running Pagefind v1.4.0 (Extended)
Source:       ".next"
Output:       "public/pagefind"
Indexed 1 language
Indexed 220 pages
Indexed 10129 words
```

### 生成されたファイル
```
public/pagefind/
├── pagefind.js (33.8KB)
├── wasm.unknown.pagefind (52.4KB)
├── fragment/
└── index/
```

### 参考記事で使用されている技術
- Next.js App Router
- Pagefind CLI
- `--output-path`オプション
- `/* webpackIgnore: true */`コメント
