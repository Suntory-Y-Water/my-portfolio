# SEO改善点リスト

## 概要

参考ブログサイト(sapper-blog-app)のSEO実装と本プロジェクト(my-portfolio)を比較し、追加できる余地のある改善点をリスト化したもの。

最終更新日: 2025-11-13

---

## 優先度: 高 (すぐに実装すべき)

### 1. RSS Feedの情報補完

**状態**: ✅ **実装済み** (2025-11-13)

**現状の問題**
- `src/app/rss.xml/route.ts` のtitleとdescriptionが"TODO"のまま

**改善案**
```typescript
// 修正前
<title>TODO</title>
<description>TODO</description>

// 修正後 (sapper-blog-appを参考)
<title>${siteConfig.name}</title>
<description>${siteConfig.description}</description>
```

**参考実装**: `sapper-blog-app/app/src/routes/rss.xml/+server.ts:22-24`

**影響範囲**
- RSS購読者へのサイト情報表示改善
- RSSリーダーでの検索性向上

---

### 2. RSS Feed画像追加

**状態**: ✅ **実装済み** (2025-11-13)

**現状**
- RSSに画像情報が含まれていない

**改善案**
```typescript
<image>
  <url>${baseUrl}/favicon.png</url>
  <title>${siteConfig.name}</title>
  <link>${baseUrl}</link>
</image>
```

**参考実装**: `sapper-blog-app/app/src/routes/rss.xml/+server.ts:26-30`

**影響範囲**
- RSSリーダーでのブランド認知向上
- フィード一覧での視認性改善

---

### 3. OGP locale設定追加

**状態**: ✅ **実装済み** (2025-11-13)

**現状**
- OGPにlocale情報が含まれていない

**改善案**
```typescript
// generateMetadata内に追加
openGraph: {
  locale: 'ja_JP',
  // 既存の設定...
}
```

**参考実装**: `sapper-blog-app/app/src/components/Ogp.svelte:25`

**影響範囲**
- SNS共有時の言語情報の明示
- 国際化対応への布石

---

### 4. Canonical URL設定

**状態**: ✅ **実装済み** (2025-11-13)

**現状**
- ブログ記事ページにcanonical URLが設定されていない

**改善案**
```typescript
// generateMetadata内に追加
export async function generateMetadata({ params }: BlogPostPageProps) {
  // ...
  return {
    // ...
    alternates: {
      canonical: absoluteUrl(`/blog/${post.slug}`),
    },
  };
}
```

**参考実装**: `sapper-blog-app/app/src/routes/blog/[slug]/+page.svelte:32`

**影響範囲**
- 重複コンテンツ問題の回避
- 検索エンジンへの正規URLの明示

---

## 優先度: 中 (実装を検討すべき)

### 5. Web App Manifest追加

**現状**
- PWA対応のためのmanifest.jsonが存在しない

**改善案**
- `public/manifest.json`を作成
- `src/app/layout.tsx`の`<head>`内にリンク追加

```json
{
  "name": "サイト名",
  "short_name": "短縮名",
  "description": "説明",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#333333",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**参考実装**: `sapper-blog-app/app/static/manifest.json`、`sapper-blog-app/app/src/app.html:8`

**影響範囲**
- PWA対応によるユーザー体験向上
- モバイルデバイスでのホーム画面追加対応
- アプリライクな動作

---

### 6. Theme Color設定

**現状**
- HTMLに`theme-color`メタタグが設定されていない

**改善案**
```typescript
// src/app/layout.tsx の <head> 内に追加
<meta name="theme-color" content="#333333" />
```

**参考実装**: `sapper-blog-app/app/src/app.html:6`

**影響範囲**
- モバイルブラウザのUIテーマ色の制御
- ブランドカラーの一貫性向上

---

### 7. 記事詳細ページのrobots設定

**状態**: ✅ **実装済み** (2025-11-13)

**現状**
- 記事ページに画像プレビュー用のrobots設定がない

**改善案**
```typescript
// generateMetadata内に追加
export async function generateMetadata({ params }: BlogPostPageProps) {
  // ...
  return {
    // ...
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  };
}
```

**参考実装**: `sapper-blog-app/app/src/routes/blog/[slug]/+page.svelte:33`

**影響範囲**
- Google検索結果での大きな画像プレビュー表示
- クリック率(CTR)の向上

---

### 8. OGP site_name追加

**状態**: ✅ **実装済み** (2025-11-13)

**現状**
- openGraphに`siteName`が設定されていない

**改善案**
```typescript
// src/app/layout.tsx または各ページの generateMetadata
openGraph: {
  siteName: siteConfig.name,
  // 既存の設定...
}
```

**参考実装**: `sapper-blog-app/app/src/components/Ogp.svelte:24`

**影響範囲**
- SNS共有時のサイト名表示
- ブランド認知度向上

---

## 優先度: 低 (将来的に検討)

### 9. 構造化データ(JSON-LD)の追加

**現状**
- Schema.org形式の構造化データが実装されていない

**改善案**
- 記事ページに `Article` スキーマを追加
- パンくずリストに `BreadcrumbList` スキーマを追加
- 著者情報に `Person` スキーマを追加

```typescript
// 例: Article スキーマ
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.metadata.title,
  datePublished: post.metadata.date,
  dateModified: post.metadata.date,
  description: post.metadata.description,
  author: {
    '@type': 'Person',
    name: siteConfig.author,
  },
  image: absoluteUrl(`/blog/ogp/${post.slug}`),
};
```

**参考**: Google Rich Results、Schema.org公式ドキュメント

**影響範囲**
- Google検索でのリッチスニペット表示
- 検索結果でのCTR向上
- ナレッジグラフへの情報提供

---

### 10. rel="author"リンクの追加

**現状**
- 著者プロフィールへのリンクがない

**改善案**
```typescript
// src/app/layout.tsx の <head> 内に追加
<link rel="author" href="著者プロフィールURL" />
```

**参考実装**: `sapper-blog-app/app/src/app.html:20`

**影響範囲**
- 著者情報の明示
- Google Authorship(現在は廃止されているが、将来の復活に備える)

---

### 11. lastBuildDateの追加

**現状**
- RSS FeedにlastBuildDateは設定されている(良い実装)

**状態**: ✅ 既に実装済み

**参考実装**: `sapper-blog-app/app/src/routes/rss.xml/+server.ts:25`

---

### 12. RSS atom:link self参照の追加

**現状**
- RSS Feedにatom:link self参照が設定されている

**状態**: ✅ 既に実装済み (`src/app/rss.xml/route.ts:17`)

---

### 13. Markdown版のダウンロードリンク

**現状**
- 記事のMarkdown形式ダウンロードリンクがない

**改善案**
- 記事詳細ページにMarkdownファイルへのリンクを追加
- `/blog/[slug].md` エンドポイントを作成

**参考実装**: `sapper-blog-app/app/src/routes/blog/[slug]/+page.svelte:109-127`

**影響範囲**
- ユーザーがオフラインで記事を読めるようになる
- 開発者にとっての利便性向上
- コンテンツの再利用性向上

---

## 実装優先順位の推奨順序

1. RSS Feedの情報補完 (即座に実施)
2. RSS Feed画像追加 (即座に実施)
3. Canonical URL設定 (重要)
4. OGP locale設定追加
5. 記事詳細ページのrobots設定
6. OGP site_name追加
7. Web App Manifest追加 (PWA対応を視野に入れる場合)
8. Theme Color設定
9. 構造化データ(JSON-LD)の追加 (リッチスニペット狙い)
10. Markdown版のダウンロードリンク (ユーザー体験向上)
11. rel="author"リンクの追加

---

## 参考資料

- 参考サイト: `sapper-blog-app/` (azukiazusa's blog)
- Google Search Central: https://developers.google.com/search
- Schema.org: https://schema.org/
- Open Graph Protocol: https://ogp.me/
- Twitter Cards: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards

---

## 既に実装済みで良好な点

### ✅ 本プロジェクトの強み

1. **Next.js Metadata API活用**
   - 型安全なメタデータ管理
   - generateMetadata関数での動的生成

2. **Sitemap自動生成**
   - ブログ記事、タグ、ペジネーション全て網羅
   - 参考サイトにはない機能

3. **Robots.txt動的生成**
   - Next.js標準機能を活用
   - disallow設定が明確

4. **Google Analytics統合**
   - @next/third-parties使用で最適化

5. **動的OGP画像生成**
   - `/blog/ogp/[slug]` エンドポイントで記事ごとに生成
   - SNS共有時のビジュアル向上

---

## 実装時の注意点

### RSS Feed修正時
- キャッシュ設定を維持する
- 既存の購読者に影響を与えないようにする

### Canonical URL追加時
- すべてのページで一貫性を保つ
- 相対URLではなく絶対URLを使用

### 構造化データ追加時
- Google Rich Results Testでバリデーション
- エラーや警告がないことを確認

### Web Manifest追加時
- 適切なアイコンサイズを用意(192x192, 512x512)
- theme_colorとbackground_colorを統一

---

## メンテナンス推奨事項

- 定期的にGoogle Search Consoleでインデックス状況を確認
- 新しいSEO標準や推奨事項をウォッチ
- Core Web Vitalsのパフォーマンス監視
- 構造化データのエラー監視
