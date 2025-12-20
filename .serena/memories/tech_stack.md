# 技術スタック詳細

## コアフレームワーク
- **Astro** 5.16.5: 静的サイトジェネレーター
- **React** 4.4.2: インタラクティブコンポーネント用
- **TypeScript** 5.9.3: 型安全性

## ランタイム・パッケージマネージャー
- **Bun**: JavaScriptランタイムおよびパッケージマネージャー

## スタイリング
- **Tailwind CSS** 4.1.18: ユーティリティファーストCSS
- **@tailwindcss/vite** 4.1.18: Vite統合
- **Radix UI**: アクセシブルなUIコンポーネント
  - @radix-ui/react-dialog
  - @radix-ui/react-dropdown-menu
  - @radix-ui/react-select
  - @radix-ui/react-separator
  - @radix-ui/react-slot
- **class-variance-authority**: バリアントベースのスタイル管理
- **clsx**: クラス名結合ユーティリティ
- **tailwind-merge**: Tailwindクラス名のマージ

## Markdown処理
- **remark** 15.0.1: Markdown パーサー
- **rehype**: HTML処理
- **rehype-pretty-code** 0.14.1: コードハイライト
- **rehype-slug** 6.0.0: 見出しID自動生成
- **rehype-mermaid** 3.0.0: Mermaid図サポート
- **remark-breaks** 4.0.0: 改行処理
- **remark-github-blockquote-alert** 2.0.1: GitHub形式のアラート

## コード品質ツール
- **Biome** 2.3.8: Linter + Formatter (ESLint/Prettier代替)
- **Prettier** 3.7.4: Astroファイル専用フォーマッター
- **prettier-plugin-astro** 0.14.1: Astro対応プラグイン

## 検索・パフォーマンス
- **Pagefind** 1.4.0: 静的サイト全文検索
- **@astrojs/partytown** 2.1.4: サードパーティスクリプト最適化

## OGP画像生成
- **Satori** 0.18.3: HTML/CSSからSVG生成
- **@resvg/resvg-js** 2.6.2: SVGからPNG変換

## テスト・品質チェック
- **Playwright** 1.57.0: E2Eテスト
- **@lhci/cli** 0.15.1: Lighthouse CI

## その他
- **gray-matter** 4.0.3: フロントマター解析
- **dompurify** 3.3.1: XSS対策
- **jsdom** 27.3.0: DOM操作
- **lucide-react** 0.561.0: アイコンライブラリ
- **cmdk** 1.1.1: コマンドパレット
