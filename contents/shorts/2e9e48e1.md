---
title: "Astroでcharset=utf-8パラメータが削除される場合がある"
date: 2025-12-28
---

Astro v5 のプリレンダリングされたエンドポイントでは、カスタム Response ヘッダーが本番ビルド時に無視される仕様がある。開発環境では以下のコードで正常に動作するが、本番ビルドでは `charset=utf-8` が削除され、日本語が文字化けする。

```ts
const headers = new Headers({
  'Content-Type': 'text/markdown; charset=utf-8',
});
return new Response(body, {
  status: 200,
  headers, // 開発環境では有効、本番ビルドでは無視される
});
```

---

デプロイ先が Cloudflare の場合、`_headers` ファイル機能を使用して解決できる。`public/_headers` に以下を追加することで、本番環境でも `charset=utf-8` を保持できる。

```
# Markdownエンドポイント: charset=utf-8を明示
/blog/*.md
  Content-Type: text/markdown; charset=utf-8
```

参考リンク: [🐛 Response headers are not set #9805](https://github.com/withastro/astro/issues/9805)