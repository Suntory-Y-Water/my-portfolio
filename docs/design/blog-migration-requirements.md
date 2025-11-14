# ブログ記事管理システム移行 要件定義

## 目的

Obsidianでブログ記事を執筆できるようにする。

### 背景
- **現状の課題**: Obsidianは標準MarkdownをサポートするがMDXは未サポート
- **ニーズ**: PCがなくてもObsidianモバイルアプリで記事を執筆したい
- **参考実装**: azukiazusa.dev（sapper-blog-app）のブログ構成

---

## 現状（AS-IS）

### ファイル構成
- **配置**: `src/content/blog/*.mdx`（13記事）
- **形式**: MDX形式
- **ビルド**: `@mdx-js/mdx` v3.1.1 + remarkプラグイン

### 使用中のMDXコンポーネント
| コンポーネント | 使用箇所数 | 機能 |
|--------------|-----------|------|
| `<LinkPreview url='...' />` | 46箇所 | 外部リンクのプレビューカード表示 |
| `<Callout>...</Callout>` | 8箇所 | 注意書き・情報ボックス |
| `<Image>` | 11箇所 | Next.js Image最適化 |

### フロントマター形式
```yaml
title: ...
date: 2025-03-17
description: ...
icon: https://...
tags:
  - ...
```

---

## 目標（TO-BE）

### ファイル構成
- **配置**: `content/blog/*.md`（ルート直下）
- **形式**: プレーンMarkdown
- **ビルド**: unified + remark/rehypeプラグイン

### Markdown構文への変換
| 変換元 | 変換先 |
|--------|--------|
| `<LinkPreview url='...' />` | remarkプラグインで自動カード化 |
| `<Callout>...</Callout>` | GFM Alerts (`> [!NOTE]`) |
| `<Image>` | 標準Markdown画像 (`![alt](url)`) |

### Obsidian対応
- `content/`をObsidianボルトとして設定可能
- Markdownのプレビュー・編集が正常に動作
- GFM Alertsが適切に表示される

---

## 要件

### 必須要件

#### ファイル配置変更
- 全記事を`src/content/blog/`から`content/blog/`へ移動
- `content/`ディレクトリをルート直下に配置
- Obsidianのボルトとして設定可能に

#### ファイル形式変換
- 全記事を`.mdx`から`.md`に変換
- MDXコンポーネント構文を標準Markdown構文に変換
- フロントマターを維持

#### LinkPreview機能
現在の`<LinkPreview>`コンポーネントと同等の機能をMarkdownで実現。

**実装選択肢**:
- **選択肢A**: remarkプラグイン活用（`remark-link-card`等）
  - メリット: 保守性が高い、標準的な実装
  - デメリット: プラグインの互換性リスク
- **選択肢B**: カスタムremarkプラグイン開発
  - メリット: 完全制御、既存ロジック流用可能
  - デメリット: 保守コスト増加
- **選択肢C**: 機能廃止
  - メリット: 実装不要
  - デメリット: ユーザー体験低下（非推奨）

**推奨**: 選択肢A（remarkプラグイン活用）

#### Callout機能
GFM Alerts記法（`> [!NOTE]`）をサポートし、現在の`<Callout>`と同等のUIで表示。

**実装方式**:
- `remark-alerts`または`rehype-alert`プラグインを導入
- 既存のCalloutスタイル（CSS）を維持

**対応する記法**:
```markdown
> [!NOTE]
> これは注意書きです

> [!WARNING]
> これは警告です

> [!TIP]
> これはヒントです
```

### 非機能要件

#### パフォーマンス
- ビルド時間が現状比150%以内
- ページ表示速度が現状と同等以上
- LinkPreview OGP取得はビルド時に実行（ランタイム遅延なし）

#### 互換性
- 既存の記事URLパス（`/blog/{slug}`）を維持
- 既存のフロントマター形式を維持
- 既存のタグslug管理システム（`src/config/tag-slugs.ts`）を維持

#### 保守性
- remarkプラグインの設定を集約（`src/lib/markdown.ts`）
- 新しいタグ追加時のチェックスクリプト（`check:tags`）を維持
- Obsidian設定ファイル（`.obsidian/`）をgitignoreに含める

---

## 制約事項

### 技術的制約
- Next.js 15系を使用（現行バージョン維持）
- Bunランタイムを使用（パッケージマネージャはpnpm）
- TypeScript型安全性を維持

### 運用制約
- 既存記事のURLは変更しない（SEO影響回避）
- 移行中もブログは稼働させる

---

## 意思決定が必要な項目

### 🔴 実装前に決定必須

#### 1. LinkPreview実装方式
- remarkプラグイン活用（推奨）
- カスタムremarkプラグイン開発
- 機能廃止

**判断基準**: 保守性、機能要件の充足度、プラグインの互換性

#### 2. フロントマター形式
- **現状維持**（推奨）:
  ```yaml
  title: ...
  date: 2025-03-17
  description: ...
  tags: [...]
  ```
- **azukiazusa.dev形式**:
  ```yaml
  id: ...
  title: ...
  slug: ...
  createdAt: 2025-03-17T00:00:00.000+09:00
  updatedAt: 2025-03-17T00:00:00.000+09:00
  tags: [...]
  published: true
  ```

**判断基準**: 移行コスト、将来のCMS連携の可能性

#### 3. 移行方式
- **一括移行**（推奨）: 全記事を一度に変換・移行
- **段階的移行**: 新記事からMDで書き、既存記事は徐々に移行

**判断基準**: 整合性維持、移行の複雑さ

### 🟡 実装中に決定可能

#### 4. 画像管理方式
- **現状維持**（推奨）: Cloudflare R2 + CDN
- content/配下に画像も配置

#### 5. Obsidianプラグイン活用
- Obsidian Community Pluginを活用するか（`obsidian-link-preview`, `obsidian-admonition`等）
- **推奨**: 標準Markdown優先、プラグインは補助的に使用

---

## 成功基準

### ビルド・デプロイ
- `pnpm run build`がエラーなく完了する
- `pnpm run typecheck`がパスする
- `pnpm run lint`がパスする
- 本番環境へのデプロイが成功する

### 機能動作
- 全13記事が個別ページで正しく表示される
- LinkPreviewが機能する（外部リンクがカード形式で表示）
- Calloutが機能する（GFM Alertsが適切なUIで表示）
- タグ機能が動作する（タグページ遷移、記事フィルタ）
- 目次が生成される

### Obsidian対応
- Obsidianで`content/`をボルトとして開ける
- Markdown記法がObsidianでプレビューされる
- GFM AlertsがObsidianで適切に表示される（または適切にフォールバック）
- Obsidianで記事を編集・保存できる

### SEO・パフォーマンス
- 既存記事のURLが維持されている（`/blog/{slug}`）
- OGP画像が生成される（`/blog/ogp/{slug}`）
- 構造化データ（JSON-LD）が出力されている
- Lighthouse スコアが90以上（Performance）

---

## 関連ドキュメント

- [移行計画書](./blog-migration-plan.md)
- [リスク管理表](./blog-migration-risks.md)
- [受入基準書](./blog-migration-acceptance-criteria.md)
