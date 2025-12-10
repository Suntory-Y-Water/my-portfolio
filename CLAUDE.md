# sui Tech Blog - Claude Code AI リファレンス

本システムは **Next.js 16 App Router** で構築された個人技術ブログプラットフォームです。Markdown形式で記事を管理し、静的生成により高速な配信を実現しています。

---

## プロジェクト概要

### 主要機能
- **Markdown記事管理** - `/contents/blog/` 配下にMarkdownファイルで記事を管理
- **タグ分類** - タグによる記事分類とタグページ自動生成
- **全文検索** - Pagefindによるクライアントサイド検索
- **OGP画像生成** - 記事ごとに自動生成された静的OGP画像
- **コードハイライト** - rehype-pretty-codeによるシンタックスハイライトとコピーボタン
- **Mermaid図** - フロー図・シーケンス図のサポート
- **リンクプレビュー** - URLをカード形式で表示

### 技術スタック
- **フレームワーク**: Next.js 16 App Router + React 19
- **ランタイム**: Bun
- **言語**: TypeScript (strict mode)
- **スタイリング**: Tailwind CSS + Radix UI
- **Markdown処理**: unified, remark, rehype
- **コード品質**: Biome (ESLint/Prettier代替)
- **検索**: Pagefind (静的全文検索)

---

## ディレクトリ構造

```
/
├── src/
│   ├── app/              # Next.js App Router (ページ・API)
│   ├── components/       # コンポーネント (ui/shared/feature の3層)
│   │   ├── ui/          # 汎用UIコンポーネント (Button, Card等)
│   │   ├── shared/      # 共有コンポーネント (Header, Footer等)
│   │   └── feature/     # 機能別コンポーネント (content/, search/)
│   ├── lib/             # ビジネスロジック・ユーティリティ
│   ├── config/          # サイト設定・タグマッピング
│   └── constants/       # 定数定義
├── contents/blog/       # Markdownブログ記事 (YYYY-MM-DD_title.md)
├── public/              # 静的ファイル
├── scripts/             # ビルド・自動化スクリプト
└── docs/adr/            # Architecture Decision Records
```

---

## コーディング規約

詳細なコーディング規約は `.claude/rules/` ディレクトリに整理されています:

### 全体適用 (常時ロード)
- **コーディング規約**: `.claude/rules/coding-standards.md`

### パス固有ルール (動的ロード)
- **UI Component規約**: `.claude/rules/components/ui.md`
- **Feature Component規約**: `.claude/rules/components/feature.md`
- **ブログ記事執筆規約**: `.claude/rules/markdown/content.md`
- **セキュリティ原則**: `.claude/rules/security/xss-prevention.md`

### 重要な原則
- **YAGNI原則**: 将来的な拡張性の考慮は禁止、現時点で必要な機能のみ実装
- **関数ベース**: クラスは使わない
- **Server Components優先**: `'use client'` は最小限に

---

## よく使うコマンド (AI向け)

```bash
# フォーマットチェック
bun run format

# 型チェック
bun run type-check:ai

# Lint
bun run lint:ai

# タグ整合性チェック
bun run check:tags
```

---

## アーキテクチャパターン

### コンポーネント階層
```
app/          (ページコンポーネント)
  ↓
feature/      (機能別コンポーネント)
  ↓
shared/       (共有コンポーネント)
  ↓
ui/           (汎用UIコンポーネント)
```

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

---

## よくあるタスク

### ブログ記事作成
```bash
# ブログテンプレート作成スクリプト実行
bun run new-blog
```

### タグ追加時の手順
1. `src/config/tag-slugs.ts` にタグIDと表示名を追加
2. 記事のフロントマターに追加: `tags: ["new-tag"]`
3. `bun run check:tags` で確認 (commit時に自動検証)

---

## MCP使い分けガイド

### Serena MCP - シンボルベースのコード操作
**コード編集、リネーム、挿入・置換、読み込みに使用**

```typescript
// シンボルの置換
mcp__serena__replace_symbol_body
name_path: 'getAllBlogPosts'
relative_path: 'src/lib/markdown.ts'
body: '新しい関数実装'

// 新しいコードの挿入
mcp__serena__insert_after_symbol
name_path: 'getBlogPostBySlug'
relative_path: 'src/lib/markdown.ts'
body: '新しい関数の実装'

// シンボルのリネーム
mcp__serena__rename_symbol
name_path: 'getPostMetadata'
relative_path: 'src/lib/markdown.ts'
new_name: 'getBlogPostMetadata'

// 参照の確認
mcp__serena__find_referencing_symbols
name_path: 'getAllBlogPosts'
relative_path: 'src/lib/markdown.ts'
```

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

---

## 参考ドキュメント

- **Serenaメモリ**: `.serena/memories/` (プロジェクト全体の理解)
- **ADR**: `docs/adr/` (アーキテクチャ決定記録)