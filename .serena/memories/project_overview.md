# プロジェクト概要

## プロジェクト名
sui Tech Blog (sui-tech-blog)

## 目的
個人技術ブログプラットフォーム。Markdown形式で記事を管理し、静的生成により高速な配信を実現する。

## 主要機能
- **Markdown記事管理**: `/contents/blog/` 配下にMarkdownファイルで記事を管理
- **タグ分類**: タグによる記事分類とタグページ自動生成
- **全文検索**: Pagefindによるクライアントサイド検索
- **OGP画像生成**: 記事ごとに自動生成された静的OGP画像
- **コードハイライト**: rehype-pretty-codeによるシンタックスハイライトとコピーボタン
- **Mermaid図**: フロー図・シーケンス図のサポート
- **リンクプレビュー**: URLをカード形式で表示

## 技術スタック
- **フレームワーク**: Astro 5.x (SSG)
- **ランタイム**: Bun
- **言語**: TypeScript
- **UIライブラリ**: React (一部コンポーネント)
- **スタイリング**: Tailwind CSS 4.x + Radix UI
- **Markdown処理**: remark, rehype
- **コード品質**: Biome 2.3.8 (ESLint/Prettier代替)
- **検索**: Pagefind 1.4.0 (静的全文検索)

## アーキテクチャ
- **静的生成 (SSG)**: ビルド時にすべての記事ページを静的生成
- **OGP画像**: ビルド時にSatoriで静的生成し、キャッシュ最適化
- **検索インデックス**: postbuildスクリプトでPagefindインデックス生成

## Markdownパイプライン
```
Markdown → remark (Markdown AST)
         → rehype (HTML AST)
         → カスタムプラグイン (コピーボタン、Mermaid、リンクカード)
         → HTML生成
```

## デプロイ環境
- **プラットフォーム**: Vercel (推測)
- **ビルドコマンド**: `bun run build`
- **出力ディレクトリ**: `dist/`
