# プロジェクト構造の詳細

## ディレクトリ構成

### `/src` - ソースコード

#### `/src/app` - Next.js App Router
Next.js 16のApp Routerを使用したルーティング構造。

**主要ルート:**
- `/` - トップページ (`page.tsx`)
- `/blog` - ブログ一覧 (`blog/page.tsx`)
- `/blog/page/[page]` - ブログページネーション
- `/blog/[slug]` - ブログ記事詳細
- `/blog/ogp/[slug]` - OGP画像生成（Route Handler）
- `/blog/md/[slug]` - Markdown配信（Route Handler）
- `/tags` - タグ一覧
- `/tags/[slug]` - タグ別記事一覧
- `/about` - Aboutページ
- `/llms.txt` - LLM向けサイト情報（Route Handler）
- `/rss.xml` - RSSフィード（Route Handler）

**特殊ファイル:**
- `layout.tsx` - レイアウト
- `error.tsx` - エラーページ
- `not-found.tsx` - 404ページ
- `sitemap.ts` - サイトマップ生成
- `robots.ts` - robots.txt生成

---

#### `/src/components` - Reactコンポーネント

##### `/src/components/ui` - 汎用UIコンポーネント
Radix UIベースの再利用可能なUIコンポーネント。

**主要コンポーネント:**
- `button.tsx` - ボタン
- `card.tsx` - カード
- `dialog.tsx` - ダイアログ・モーダル
- `dropdown-menu.tsx` - ドロップダウンメニュー
- `select.tsx` - セレクトボックス
- `badge.tsx` - バッジ
- `separator.tsx` - 区切り線
- `skeleton.tsx` - スケルトンローディング
- `breadcrumb.tsx` - パンくずリスト
- `command.tsx` - コマンドパレット
- `ModeToggle.tsx` - ダークモード切り替え
- `theme-provider.tsx` - テーマプロバイダー
- `post-list-skeleton.tsx` - 投稿リストスケルトン

##### `/src/components/shared` - 共有コンポーネント
アプリケーション全体で使用される共有コンポーネント。

**主要コンポーネント:**
- `Header.tsx` - ヘッダー
- `Footer.tsx` - フッター
- `MenuMobile.tsx` - モバイルメニュー
- `pagination.tsx` - ページネーション
- `page-header.tsx` - ページヘッダー
- `image-with-fallback.tsx` - フォールバック付き画像
- `callout.tsx` - 注意書き・コールアウト

##### `/src/components/icons` - アイコンコンポーネント
- `lucide-icons.tsx` - Lucideアイコン
- `social-icons.tsx` - ソーシャルアイコン
- `index.ts` - エクスポート

##### `/src/components/feature` - 機能別コンポーネント

###### `/src/components/feature/content` - コンテンツ関連
- `blog-card.tsx` - ブログカード
- `markdown-content.tsx` - Markdownコンテンツ表示
- `custom-markdown.tsx` - カスタムMarkdown処理
- `code-block.tsx` - コードブロック
- `markdown-copy-button.tsx` - コードコピーボタン
- `table-of-contents.tsx` - 目次
- `link-preview.tsx` - リンクプレビューカード
- `github-edit-button.tsx` - GitHub編集リンク
- `blog-back-button.tsx` - ブログ戻るボタン
- `remember-blog-list-path.tsx` - ブログリスト遷移の記憶
- `view-transition.tsx` - View Transitions API対応
- `restore-scroll-position.tsx` - スクロール位置復元

###### `/src/components/feature/search` - 検索機能
- `search-dialog.tsx` - 検索ダイアログ
- `search-trigger.tsx` - 検索トリガーボタン

---

#### `/src/lib` - ユーティリティ関数・ライブラリ

**主要ファイル:**
- `markdown.ts` - Markdown処理関連（ブログ記事の取得、パース）
- `utils.ts` - 汎用ユーティリティ（`cn`関数など）
- `pagination.ts` - ページネーション処理
- `blog-navigation.ts` - ブログナビゲーション
- `toc.ts` - 目次生成
- `emoji-converter.ts` - 絵文字変換
- `inline-icons.ts` - インラインアイコン処理
- `rehype-code-copy-button.ts` - コードコピーボタンrehypeプラグイン
- `rehype-link-card.ts` - リンクカードrehypeプラグイン
- `rehype-mermaid-code.ts` - Mermaid図rehypeプラグイン

---

#### `/src/config` - 設定ファイル
- `site.ts` - サイト設定（メタデータ、SNSリンクなど）
- `tag-slugs.ts` - タグスラッグ定義

#### `/src/constants` - 定数定義
- `index.ts` - アプリケーション全体で使用する定数

#### `/src/types` - 型定義
- `markdown.ts` - Markdown関連の型定義
- `site-config.ts` - サイト設定の型定義
- `pagefind.d.ts` - Pagefind型定義
- `global.d.ts` - グローバル型定義

#### `/src/actions` - Server Actions
- `fetch-og-metadata.ts` - OGPメタデータ取得

#### `/src/styles` - グローバルスタイル
- `globals.css` - グローバルCSS
- `markdown.css` - Markdownスタイル

#### `/src/assets` - アセット
- `/fonts` - カスタムフォント（PlemolJP、NotoSansJP）

---

### `/contents` - ブログコンテンツ

#### `/contents/blog` - Markdown記事
ブログ記事をMarkdown形式で管理。

**命名規則:**
- `YYYY-MM-DD_slug.md`（例: `2025-12-06_delegate-coding-rules-to-biome.md`）

**フロントマター例:**
```yaml
---
title: 記事タイトル
published: 2025-12-06
updated: 2025-12-06
description: 記事の説明
tags:
  - tag1
  - tag2
icon: 絵文字アイコン
---
```

#### `/contents/slides` - スライド
Marpを使用したスライド。

#### その他
- `package.json` - textlint設定
- `.textlintrc.json` - textlintルール
- `.textlintignore` - textlint除外ファイル
- `writing-style.md` - 執筆ガイドライン

---

### `/public` - 静的ファイル

**主要ディレクトリ:**
- `/icons` - SVGアイコン
- `/images` - 画像ファイル
- `/pagefind` - Pagefind検索インデックス（ビルド時生成）

---

### `/docs` - ドキュメント

#### `/docs/adr` - Architecture Decision Records
- `index.json` - ADRインデックス
- `/decisions` - 個別のADRファイル（JSON形式）

**既存ADR:**
- `0001-auto-branch-creation-blog-script.json` - ブログ記事作成スクリプトでの自動ブランチ作成
- `0002-constants-centralization.json` - 定数とURL設定の一元化
- `0003-svg-xss-security.json` - SVGとMarkdownにおけるXSS脆弱性の対策
- `0004-dompurify-implementation-change.json` - DOMPurify実装方法の変更とリンクカードサニタイズの追加

#### `/docs/design` - 設計ドキュメント
- `coding-rules.md` - コーディング規約
- `bundle-size-report.md` - バンドルサイズレポート

#### その他
- `blog-return-navigation.md` - ブログ戻るナビゲーション調査
- `blog-return-scroll-investigation.md` - ブログ戻るスクロール位置調査

---

### `/scripts` - ビルド・運用スクリプト

**主要スクリプト:**
- `create-blog-template.ts` - ブログ記事テンプレート作成
- `update-blog-icon.ts` - ブログアイコン自動更新
- `check-tags.ts` - タグ整合性チェック
- `check-svg-security.ts` - SVGセキュリティチェック
- `detect-url-without-blank-lines.ts` - URL周辺の空行検出
- `fix-url-blank-lines.ts` - URL周辺の空行自動修正

---

### `/.claude` - Claude Code設定

**カスタムエージェント:**
- `agents/spec-document-creator.md` - 仕様書作成エージェント
- `agents/adr-memory-manager.md` - ADR管理エージェント
- `agents/project-onboarding.md` - プロジェクトオンボーディングエージェント

**コマンド:**
- `commands/` - カスタムスラッシュコマンド

**プロジェクト設定:**
- `CLAUDE.md` - 開発ワークフロールール
- `MCP_REFERENCE.md` - MCP参照ドキュメント
- `AGENTS.md` - エージェント一覧

---

### `/.husky` - Gitフック
- `pre-commit` - コミット前の自動チェック
  - SVGセキュリティチェック
  - ブログアイコン自動変換
  - タグ整合性チェック
  - textlint（日本語校正）

---

### `/.serena` - Serena MCP設定
- `/memories` - Serenaメモリファイル（プロジェクト情報）

---

### `/.github` - GitHub設定
- `/workflows` - GitHub Actions設定

---

### `/.vscode` - VS Code設定
- 推奨拡張機能
- エディタ設定

---

## 設定ファイル

### ルートディレクトリ
- `package.json` - プロジェクト依存関係・スクリプト
- `bun.lock` - Bunロックファイル
- `tsconfig.json` - TypeScript設定
- `tsconfig.build.json` - ビルド用TypeScript設定
- `next.config.mjs` - Next.js設定
- `biome.json` - Biome設定（Lint・フォーマット）
- `tailwind.config.ts` - Tailwind CSS設定
- `postcss.config.js` - PostCSS設定
- `components.json` - shadcn/ui設定
- `.gitignore` - Git除外設定
- `vercel.json` - Vercel設定
- `.mcp.json` - MCP設定

---

## ビルド成果物

### `/.next` - Next.jsビルド成果物
- ビルドキャッシュ
- サーバーバンドル
- クライアントバンドル
- 静的ファイル
- `/analyze` - バンドル分析結果

### `/.kiri` - Kiri MCP インデックス
- `index.duckdb` - コードベース検索インデックス

---

## データフロー

### ブログ記事の流れ
1. `contents/blog/*.md` - Markdown記事作成
2. `src/lib/markdown.ts` - Markdown読み込み・パース
3. `src/app/blog/[slug]/page.tsx` - 記事詳細ページ表示
4. Pagefind - 検索インデックス生成（ビルド時）

### コンポーネントの依存関係
- `ui` - 最下層の汎用UIコンポーネント
- `shared` - `ui`を使用した共有コンポーネント
- `feature` - `ui`と`shared`を使用した機能別コンポーネント
- `app` - すべてのコンポーネントを使用したページ

### 設定の読み込み
- `src/config/site.ts` - サイト設定の中心
- `src/constants/index.ts` - 定数の中心
- アプリケーション全体で参照

---

## まとめ

このプロジェクトは、以下の特徴を持つ構造になっています：

1. **モダンなNext.js App Router構造** - ファイルベースルーティング
2. **コンポーネントの階層化** - ui → shared → feature → app
3. **Markdown中心のコンテンツ管理** - `contents/blog`
4. **セキュリティ重視** - ADR、SVGチェック、DOMPurify
5. **開発者体験の向上** - スクリプト、Gitフック、Claude Code統合
