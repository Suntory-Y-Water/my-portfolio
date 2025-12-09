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
├── contents/blog/       # Markdownブログ記事 (YYYY/MM-title.md)
├── public/              # 静的ファイル
├── scripts/             # ビルド・自動化スクリプト
└── docs/adr/            # Architecture Decision Records
```

---

## よく使うコマンド (AI向け)

以下のコマンドを使用して品質チェックを実施してください:

```bash
# フォーマットチェック 
bun run format

# 型チェック
bun run type-check:ai

# Lint 
bun run lint:ai
```

---

## コーディング規約

### 型定義
- **Omit, Pick で既存型を再利用する** - 同じような型を別途定義しない
- **配列は `[]` 記法を使用** - `User[]` (良い) vs `Array<User>` (悪い)

### 関数定義
- **最上位の関数は `function` 宣言** - 見通しを良くする
- **map、filter、即時関数はアロー関数** - 簡潔に記述

### アンチパターン (禁止事項)
- **クラスは使わない** - 関数ベースの実装を優先
- **暗黙のフォールバックは禁止** - デフォルト値や暗黙の処理を避ける
- **スイッチ引数は禁止** - boolean引数で動作を切り替えない
- **オプショナル引数・デフォルト値は禁止** - 必須引数として明示
- **YAGNI原則** - 将来的な拡張性の考慮は禁止、現時点で必要な機能のみ実装
- **ラッパー関数の作成禁止** - 合理的な理由がない限り直接呼び出し
- **不要なexportは禁止** - 使用されていない関数や型定義をexportしない
- **バレルインポート禁止** - `@/` aliasを使用した個別インポートを使用

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

### Server Components vs Client Components
- **デフォルトはServer Components** - `'use client'`は最小限に
- **Client Componentsが必要な場合**:
  - イベントハンドラー (`onClick`, `onChange`)
  - React Hooks (`useState`, `useEffect`)
  - ブラウザAPI (`localStorage`, `window`)

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

### タグ追加時の手順(3は commit 時に自動検証)
1. **タグマッピングに追加**: `src/config/tag-slugs.ts` にタグIDと表示名を追加
2. **記事のフロントマターに追加**: `tags: ["new-tag"]` を記述
3. **整合性チェック実行**: `bun run check:tags` で確認

---

## MCP使い分けガイド

### 調査・実装フェーズ - Serena MCP
**シンボルベースのコード編集、リネーム、挿入・置換、読み込みに使用**

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

### ライブラリドキュメント - Context7 MCP
**最新のライブラリドキュメント取得に使用(場合によって有効化されていないときあり!)**

```typescript
// ライブラリIDを解決
mcp__context7__resolve-library-id
library_name: 'rehype-pretty-code'

// ドキュメント取得
mcp__context7__get-library-docs
library_id: 'resolved-library-id'
```

---

## コード更新後の作業フロー

### Git操作
```bash
# 変更内容確認
git status
git diff

# ブランチの確認
git branch
# mainなら保護ルールがあるため、新しいブランチを作成
git switch -c feature-<修正した内容>

# ステージング
git add .

# コミット (日本語、簡潔に、作成者情報不要)
git commit -m "feat: 新機能の概要"
# type例: feat, fix, refactor, docs, test, style, chore

# プッシュ
git push origin <branch-name>
```

### 3. PR作成
```bash
gh pr create --title "PR title" --body "PR description"
```