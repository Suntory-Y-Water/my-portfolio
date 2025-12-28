# sui Tech Blog - Claude Code AI リファレンス

本システムは **Astro** で構築された個人技術ブログプラットフォームです。Markdown形式で記事を管理し、静的生成により高速な配信を実現しています。

## 目的
個人技術ブログプラットフォーム。Markdown形式で記事を管理し、静的生成により高速な配信を実現する。

## 主要機能
- **Markdown記事管理**: `contents/blog/` 配下にMarkdownファイルで記事を管理
- **全文検索**: Pagefindによるクライアントサイド検索
- **OGP画像生成**: 記事ごとに自動生成された静的OGP画像

## 技術スタック
- **フレームワーク**: Astro 5.x (SSG)
- **ランタイム**: Bun
- **UIライブラリ**: React (一部コンポーネント)
- **スタイリング**: Tailwind CSS 4.x + Radix UI
- **Markdown処理**: remark, rehype

## アーキテクチャ
- **静的生成 (SSG)**: ビルド時にすべての記事ページを静的生成
- **OGP画像**: ビルド時にSatoriで静的生成し、キャッシュ最適化
- **検索インデックス**: postbuildスクリプトでPagefindインデックス生成

### 静的生成 (SSG)
- ビルド時にすべての記事ページを静的生成
- OGP画像も静的生成し、キャッシュ最適化
- Pagefindインデックスはpostbuildスクリプトで生成

### Markdownパイプライン
```
remark (Markdown AST)
  → rehype (HTML AST)
  → カスタムプラグイン (コピーボタン、Mermaid、リンクカード)
  → HTML生成
```

## MCP使い分けガイド

### Context7 MCP - ライブラリドキュメント取得
**最新のライブラリドキュメント取得に使用 (有効化されていない場合あり)**

```typescript
// ライブラリIDを解決
mcp__context7__resolve-library-id
library_name: 'rehype-pretty-code'

// ドキュメント取得
mcp__context7__get-library-docs
library_id: 'resolved-library-id'
```

### Kiri MCP - コードのRead

**1-1. コンテキスト自動取得（推奨）**
```
mcp__kiri__context_pnpmdle
goal: 'user authentication, login flow, JWT validation'
limit: 10
compact: true
```
- タスクに関連するコードスニペットを自動でランク付けして取得
- `goal`には具体的なキーワードを使用（抽象的な動詞は避ける）
- `compact: true`でトークン消費を95%削減

**1-2. 具体的なキーワード検索**
```
mcp__kiri__files_search
query: 'validateToken'
lang: 'typescript'
path_prefix: 'src/auth/'
```
- 関数名、クラス名、エラーメッセージなど具体的な識別子で検索
- 広範な調査には`context_pnpmdle`を使用

**1-3. 依存関係の調査**
```
mcp__kiri__deps_closure
path: 'src/auth/login.ts'
direction: 'inbound'
max_depth: 3
```
- 影響範囲分析（inbound）や依存チェーン（outbound）を取得
- リファクタリング時の影響調査に最適

**1-4. コードの詳細取得**
```
mcp__kiri__snippets_get
path: 'src/auth/login.ts'
```
- ファイルパスがわかっている場合に使用
- シンボル境界を認識して適切なセクションを抽出

## gh コマンドの使用
GitHub にある情報を取得する場合は `gh` コマンドを使用する

### ユースケース例

- Issue, ソースコード, コメントの取得
- PR の発行、Issue の作成