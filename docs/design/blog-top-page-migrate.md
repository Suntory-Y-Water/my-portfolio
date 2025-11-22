# ページレイアウト構造変更仕様書（URL変更最小）

## 概要

URL変更を最小限に抑えつつ、自己紹介ページを `/about` へ移設し、トップはブログ一覧を表示する。`/blog` は1ページ目として据え置き、トップでは最新N件（少なめ）を出す。

**変更方針:**
- `/` はリダイレクトしない。`src/app/page.tsx` をブログ一覧表示（トップ用の件数）に差し替える
- `/about` に現行トップページ（自己紹介）の内容を移す
- ブログ一覧は `/blog` を1ページ目として維持（ここは一覧ページとして10件表示）
- ページネーションは `/blog/page/[page]` を2ページ目以降で使用

## 現状の構成

### ルーティング構造

| パス | ファイル | 内容 |
|------|---------|------|
| `/` | `src/app/page.tsx` | 自己紹介 |
| `/blog` | `src/app/blog/page.tsx` | ブログ一覧（1ページ目） |
| `/blog/page/[page]` | `src/app/blog/page/[page]/page.tsx` | ブログページネーション |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | ブログ記事詳細 |
| `/tags` | `src/app/tags/page.tsx` | タグ一覧 |

### ヘッダーナビゲーション

`src/components/shared/Header.tsx` の `NAVIGATION_LINKS`：
```typescript
[
  { href: '/', title: 'Home', icon: <IoMdHome /> },
  { href: '/blog', title: 'Blog', icon: <MdOutlineBook /> },
  { href: '/tags', title: 'Tags', icon: <Icons.tag /> }
]
```

## 変更後の構成

### ルーティング構造（変更後）

| パス | ファイル | 内容 | 変更 |
|------|---------|------|------|
| `/` | `src/app/page.tsx` | ブログ一覧（トップ用の表示件数で表示） | 🛣️ 振る舞い変更 |
| `/about` | `src/app/about/page.tsx` | 自己紹介 | ✨ 新規 |
| `/blog` | `src/app/blog/page.tsx` | ブログ一覧（1ページ目・10件表示） | ✅ 維持 |
| `/blog/page/[page]` | `src/app/blog/page/[page]/page.tsx` | ブログページネーション（2ページ目以降） | ✅ 維持 |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | ブログ記事詳細 | ✅ 維持 |
| `/blog/ogp/[slug]` | `src/app/blog/ogp/[slug]/route.tsx` | OGP画像生成 | ✅ 維持 |
| `/blog/md/[slug]` | `src/app/blog/md/[slug]/route.ts` | マークダウン取得API | ✅ 維持 |
| `/tags` | `src/app/tags/page.tsx` | タグ一覧 | 変更なし |

### ヘッダーナビゲーション（変更後）

`src/components/shared/Header.tsx` の `NAVIGATION_LINKS`：
```typescript
[
  { href: '/blog', title: 'Home', icon: <IoMdHome /> },  // ブログ1ページ目
  { href: '/about', title: 'About', icon: <IoMdPerson /> },
  { href: '/tags', title: 'Tags', icon: <Icons.tag /> }
]
```

**変更点:**
- Home の行き先を `/` → `/blog` に変更（トップはブログ短縮版を表示するため導線を `/blog` に寄せる）
- `About` を追加（人物系アイコン）
- `Blog` ラベルの独立リンクは不要（Home がブログトップを指すため）

## 実装の詳細

### 重要: 定数管理について

**ADR-0002「定数とURL設定の一元化」に従い、すべての定数は `src/constants/index.ts` で一元管理されています。**

ページネーション関連の定数:
- `BLOG_CONSTANTS.TOP_PAGE_POSTS_COUNT`: トップページに表示する記事数（5件）
- `BLOG_CONSTANTS.POSTS_PER_PAGE`: ページネーションの1ページあたりの記事数（10件）

実装時の注意:
- 定数をハードコーディングせず、必ず `@/constants` からインポートして使用する
- `paginateItems()` の `pageSize` は上記定数を使用
- 詳細は `docs/adr/decisions/0002-constants-centralization.json` を参照

### 1. 新規/変更するファイル

#### `src/app/about/page.tsx`
- 現在の `src/app/page.tsx`（自己紹介）の内容をコピー
- タイトル「私について」を維持
- `Career` コンポーネントをそのまま使用

#### `src/app/page.tsx`
- トップページとしてブログ一覧を描画（`BLOG_CONSTANTS.TOP_PAGE_POSTS_COUNT` 件）
- `/blog` の1ページ目とは件数が異なる点に注意

#### `src/app/blog/page.tsx`
- 1ページ目として据え置き（10件表示）
- 「すべての投稿を見る」は `/blog/page/2` など2ページ目以降へ誘導
- `BLOG_CONSTANTS.POSTS_PER_PAGE` を使用

#### `src/app/blog/page/[page]/page.tsx`
- 2ページ目以降のページネーション（現行維持）
- `BLOG_CONSTANTS.POSTS_PER_PAGE` を使用

### 2. ヘッダーナビゲーション更新

`src/components/shared/Header.tsx`：
- Home を `/blog` に変更
- `About` を追加（人物系アイコン）

### 3. サイト設定/SEO更新

`src/app/sitemap.ts`：
- `/about` を静的ページに追加
- `/blog` をトップとして残す
- ページネーションは `/blog/page/:page` のまま

`src/app/rss.xml/route.ts`：
- チャンネルの `<link>`/`<guid>`/`<atom:link>` は `/blog` ベースを維持
- 各記事リンクも `/blog/${slug}` のまま

`src/app/robots.ts`：
- `sitemap` のURLが `sitemap.ts` の出力先と一致することを確認（変更なし想定）

`src/config/site.ts`：
- トップがブログ一覧になる前提で `description`/`blogDescription` の文言を確認

## 影響範囲

**必須:**
1. `src/app/about/page.tsx` - 新規作成（現 `/` 内容を移設）
2. `src/app/page.tsx` - `/` でブログ一覧（短縮件数）を表示
3. `src/app/blog/page.tsx` - 1ページ目導線調整（10件表示）
4. `src/app/blog/page/[page]/page.tsx` - 2ページ目以降（据え置き、定数確認）
5. `src/components/shared/Header.tsx` - ナビゲーション更新
6. `src/app/sitemap.ts` - ルート構造に合わせて更新
7. `src/app/rss.xml/route.ts` - `/blog` ベースで整合性確認
8. `src/config/site.ts` - 説明文の整合性確認

**削除:**
- なし（ブログ配下のルートは維持）

## 作業手順（推奨）

1. `src/app/about/page.tsx` を作成し、現 `src/app/page.tsx` の自己紹介内容を移す
2. Homeリンクを `/blog` に変更し、`About` を追加（`Header.tsx`）
3. `src/app/page.tsx` をブログ一覧化（短縮件数）
4. `src/app/blog/page.tsx` の導線を確認（1ページ目として運用することを明記）
5. SEO系を更新: `sitemap.ts`, `rss.xml/route.ts`, `robots.ts`（必要なら）、`site.ts`
6. テスト: ルーティング（`/`, `/blog`, `/blog/page/2`, `/about`, `/blog/slug`）、sitemap/rss 出力のURL確認

## 注意点

- 定数は必ず `@/constants` を使用（`BLOG_CONSTANTS.TOP_PAGE_POSTS_COUNT`, `BLOG_CONSTANTS.POSTS_PER_PAGE`）
- `/` で描画する場合は canonical を `/blog` に寄せて重複コンテンツを避ける
- 1ページ目は `/blog` 固定。`/blog/page/1` を使わない導線にする（必要なら `/blog/page/1` を `/blog` にリダイレクト）
- 外部リンク/ブックマークは `/blog` を前提に崩さない
