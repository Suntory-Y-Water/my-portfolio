# Markdown エンドポイントの文字化け問題と解決

## 課題

本番ビルド環境で `/blog/*.md` エンドポイントにアクセスすると、日本語が文字化けする問題が発生。

### 現象

- **開発環境 (`bun run dev`):** 正常に表示される
- **本番ビルド (`bun run build && bun run start`):** 文字化けする

### 原因調査結果

#### HTTP ヘッダーの確認

```bash
# 開発環境 (4322)
Content-Type: text/markdown; charset=utf-8  ✅

# 本番環境 (4321)
Content-Type: text/markdown  ❌ charset が欠落
```

#### 根本原因

**Astro v5 の仕様変更:**

プリレンダリングされた静的エンドポイントでは、カスタム Response ヘッダーが本番ビルド時に無視される。

エンドポイントコード (`src/pages/blog/[slug].md.ts`) で以下のように設定していても:

```typescript
const headers = new Headers({
  'Content-Type': 'text/markdown; charset=utf-8',
});

return new Response(body, {
  status: 200,
  headers,  // ← 開発環境では有効、本番ビルドでは無視される
});
```

開発環境では動作するが、本番ビルドでは `charset=utf-8` が削除される。

### 参考資料

- [Astro Endpoints Documentation](https://docs.astro.build/en/guides/endpoints/)
- [GitHub Issue #9805: Response headers are not set](https://github.com/withastro/astro/issues/9805)

## 解決策

### 実装内容

Cloudflare Workers の `_headers` ファイル機能を使用してヘッダーを設定。

**`public/_headers` に以下を追加:**

```
# Markdownエンドポイント: charset=utf-8を明示
/blog/*.md
  Content-Type: text/markdown; charset=utf-8
```

### 動作の仕組み

1. `bun run build` で `dist/` にビルド
2. `public/_headers` が `dist/_headers` にコピーされる
3. `wrangler deploy` で Cloudflare Workers にデプロイ
4. Cloudflare Workers が `_headers` を読み込み、`/blog/*.md` へのリクエストに `charset=utf-8` を付与

### 注意事項

#### ローカルプレビューでは依然として文字化けする

`bun run start` (Astro preview サーバー) では `_headers` ファイルが読み込まれないため、ローカルでは文字化けが発生する。

**これは正常な挙動。**

#### 動作確認方法

以下のいずれかで確認:

1. **Cloudflare Workers ローカルエミュレーション:**
   ```bash
   wrangler dev
   # → http://127.0.0.1:8787/blog/xxx.md
   ```

2. **本番環境デプロイ後:**
   ```bash
   wrangler deploy
   curl -I https://suntory-n-water.com/blog/xxx.md
   # Content-Type: text/markdown; charset=utf-8 が確認できる
   ```

## ファイル変更

- `public/_headers` - `/blog/*.md` のヘッダー設定を追加

## 検討したが不採用だった案

### prebuild スクリプトで静的ファイル生成

`public/blog/` に事前に `.md` ファイルを生成する方法も検討したが、以下の理由で不採用:

- スクリプトが増える
- Content Collections との直接連携が失われる
- 開発体験が悪化する

`_headers` 設定のみで解決できるため、エンドポイントはそのまま残す方針とした。

## 結論

Astro v5 + Cloudflare Workers 環境では、プリレンダリングされたエンドポイントのカスタムヘッダーは `_headers` ファイルで設定する必要がある。
