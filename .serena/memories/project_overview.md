# プロジェクト概要

## プロジェクト名
sui-portfolio

## 目的
個人ポートフォリオサイト。ブログ機能と個人情報を含む総合的なWebサイト。

## 技術スタック

### メインフレームワーク
- Next.js 15.5.2 (React 19.1.1)
- TypeScript
- App Routerを使用

### スタイリング
- Tailwind CSS
- Radix UI（ダイアログ、セレクト、ドロップダウンメニューなど）
- Lucide React（アイコン）
- class-variance-authority（スタイルバリアント）

### コンテンツ管理
- MDX（@mdx-js/mdx）
- Gray Matter（フロントマター解析）
- Remark/Rehype プラグイン
  - rehype-slug
  - rehype-pretty-code  
  - remark-gfm

### 開発ツール
- ESLint（TypeScript ESLint、React、Next.js、Tailwind CSS）
- Prettier（Tailwind CSS プラグイン付き）
- pnpm（パッケージマネージャー）

### その他
- Next Themes（ダークモード対応）
- Day.js（日付操作）
- Bundle Analyzer（バンドル分析）
- Cloudflare R2（画像ストレージ）

## 特徴
- ブログ機能（MDXベース）
- タグ機能
- ページネーション
- RSS配信
- OGP画像生成
- セキュリティヘッダー設定
- レスポンシブデザイン