# プロジェクト概要

## プロジェクト名
sui Tech Blog (`sui-tech-blog`)

## 目的
個人技術ブログサイトの構築・運営プラットフォーム

## 技術スタック

### フロントエンド・フレームワーク
- **Next.js 16.0.7** - App Routerを使用したモダンなReactフレームワーク
- **React 19.2.1** - UIライブラリ
- **TypeScript 5.9.3** - 型安全な開発

### ランタイム・ビルドツール
- **Bun** - JavaScriptランタイム、パッケージマネージャー、ビルドツール

### スタイリング
- **Tailwind CSS 3.4.18** - ユーティリティファーストCSSフレームワーク
- **Radix UI** - アクセシブルなUIコンポーネント
- **lucide-react** - アイコンライブラリ
- **next-themes** - ダークモード対応

### コンテンツ管理
- **Markdown** - ブログ記事の記述形式
- **gray-matter** - フロントマターのパース
- **unified/remark/rehype** - Markdownの処理・変換パイプライン
- **rehype-pretty-code** - コードブロックのシンタックスハイライト
- **Mermaid** - ダイアグラム描画
- **Pagefind** - 静的サイト向け全文検索エンジン

### コード品質・リンティング
- **Biome 2.3.7** - フォーマッター・リンター(ESLint・Prettierの代替)
- **TypeScript** - 型チェック
- **textlint** - Markdown記事の日本語校正

### セキュリティ
- **DOMPurify + jsdom** - XSS対策のHTMLサニタイゼーション
- カスタムSVGセキュリティチェックスクリプト

### デプロイ・ホスティング
- **Vercel** - 本番環境のホスティング
- **GitHub** - ソースコード管理、CI/CD

### その他ツール
- **Husky** - Gitフック管理
- **@next/bundle-analyzer** - バンドルサイズ分析

## プロジェクト構造

```
/
├── src/                    # ソースコード
│   ├── app/               # Next.js App Router
│   │   ├── blog/         # ブログ関連ページ
│   │   ├── tags/         # タグページ
│   │   └── about/        # Aboutページ
│   ├── components/       # Reactコンポーネント
│   │   ├── ui/          # 汎用UIコンポーネント
│   │   ├── shared/      # 共有コンポーネント
│   │   ├── feature/     # 機能別コンポーネント
│   │   └── icons/       # アイコンコンポーネント
│   ├── lib/             # ユーティリティ関数
│   ├── config/          # 設定ファイル
│   ├── types/           # 型定義
│   ├── constants/       # 定数定義
│   ├── actions/         # Server Actions
│   └── styles/          # グローバルスタイル
├── contents/            # ブログコンテンツ
│   ├── blog/           # Markdown記事
│   └── slides/         # スライド(Marp)
├── public/             # 静的ファイル
├── docs/               # ドキュメント
│   ├── adr/           # Architecture Decision Records
│   └── design/        # 設計ドキュメント
├── scripts/           # ビルド・運用スクリプト
├── .claude/           # Claude Code設定
└── .husky/            # Gitフック

```

## 主要な機能

### ブログ機能
- Markdown形式での記事作成
- フロントマターによるメタデータ管理
- タグによる記事分類
- ページネーション
- 全文検索(Pagefind)
- OGP画像生成
- 目次(Table of Contents)
- コードブロックのコピーボタン
- リンクプレビューカード
- GitHub編集リンク

### UI/UX
- ダークモード対応
- レスポンシブデザイン
- View Transitions API対応
- スクロール位置の復元
- ブログリスト遷移の記憶

### セキュリティ
- XSS対策(DOMPurify)
- SVGセキュリティチェック
- CSP(Content Security Policy)設定
- セキュリティヘッダー設定

### 開発者体験
- 自動ブログテンプレート作成スクリプト
- 自動ブランチ作成
- Gitフックによる自動チェック
  - SVGセキュリティ検証
  - ブログアイコン自動変換
  - タグ整合性チェック
  - textlintによる日本語校正

## 開発環境
- **OS**: macOS (Darwin)
- **ランタイム**: Bun
- **エディタ**: VS Code(推奨)
- **Git**: GitHub
