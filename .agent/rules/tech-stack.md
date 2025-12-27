---
trigger: always_on
glob: 
description: "Astro, Bun, Tailwind CSSなどの技術スタックと主要なライブラリを定義します。"
---

# 技術スタックとアーキテクチャ

本プロジェクトは以下の技術スタックに厳密に従って構築された個人技術ブログプラットフォームです。

## コア技術
- **フレームワーク**: Astro 5.x (SSG)
- **ランタイム**: Bun
- **言語**: TypeScript, Markdown (コンテンツ用)

## UI & スタイリング
- **スタイリング**: Tailwind CSS 4.x
- **コンポーネント**: React (インタラクティブなアイランド用), Radix UI

## ビルド & コンテンツパイプライン
- **SSG**: ビルド時にすべてのページを静的生成します。
- **Markdown処理**: remark (AST), rehype (HTML AST)
- **検索**: Pagefind (クライアントサイド検索, ビルド後スクリプトでインデックス作成)
- **OGP**: Satoriを使用してビルド時に静的に生成します。

## 制約事項
- Bunに同等のコマンドがある場合は、Node.jsのコマンドを提案しないでください（例: `npm install` ではなく `bun install` を使用）。
- サイトの静的な性質を尊重してください。Cloudflare Workersを使用する場合を除き、動的なサーバーサイドロジックは避けてください。
