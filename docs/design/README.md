# ブログ記事管理システム移行 設計ドキュメント

ブログ記事管理システムのMDX→Markdown移行に関する設計ドキュメント。

## ドキュメント一覧

### [要件定義書](./blog-migration-requirements.md)
移行の目的、現状と目標、要件、意思決定が必要な項目を定義。

**主な内容**:
- 現状（AS-IS）: `src/content/blog/*.mdx`、MDXコンポーネント使用状況
- 目標（TO-BE）: `content/blog/*.md`、Obsidian対応
- 必須要件: ファイル配置変更、形式変換、LinkPreview/Callout機能
- 意思決定項目: 実装方式、フロントマター形式、移行方式、画像管理

---

### [移行計画書](./blog-migration-plan.md)
移行の実行計画、各フェーズの作業内容、手順を記載。

**フェーズ**:
- Phase 0: 意思決定
- Phase 1: プロトタイプ検証
- Phase 2: 変換ツール開発
- Phase 3: ビルドシステム移行
- Phase 4: テスト＆デプロイ

---

### [リスク管理表](./blog-migration-risks.md)
移行に伴うリスクと対策を記載。

**主なリスク**:
- クリティカル: remarkプラグインの互換性問題、データ損失、ビルドエラー
- 重要: パフォーマンス劣化、Obsidian互換性問題、SEO影響
- 注意: 表示崩れ、タグ追加漏れ

---

### [受入基準書](./blog-migration-acceptance-criteria.md)
移行完了の判定基準を記載。

**主な基準**:
- ファイル配置・形式
- コンテンツ変換
- ビルド・デプロイ
- 機能動作（記事表示、LinkPreview、Callout、タグ、目次）
- Obsidian対応
- SEO・パフォーマンス

---

## ギャップ分析サマリー

### 現状（AS-IS）
- **配置**: `src/content/blog/*.mdx`（13記事）
- **形式**: MDX形式
- **コンポーネント**: `<LinkPreview>`（46箇所）、`<Callout>`（8箇所）、`<Image>`（11箇所）
- **Obsidian対応**: 不可

### 目標（TO-BE）
- **配置**: `content/blog/*.md`
- **形式**: プレーンMarkdown
- **プラグイン**: remarkプラグインで機能実装
- **Obsidian対応**: 完全対応

### 主なギャップ
1. MDXコンポーネント → Markdown構文の変換（65箇所）
2. ビルドシステムの再構築（`@mdx-js/mdx` → `unified`）
3. LinkPreview機能の代替実装（remarkプラグイン）
4. Callout機能の代替実装（GFM Alerts）

---

## 意思決定が必要な項目

### 実装前に決定必須

1. **LinkPreview実装方式**
   - remarkプラグイン活用（推奨）
   - カスタムremarkプラグイン開発
   - 機能廃止

2. **フロントマター形式**
   - 現状維持（推奨）
   - azukiazusa.dev形式

3. **移行方式**
   - 一括移行（推奨）
   - 段階的移行

4. **画像管理方式**
   - 現状維持（Cloudflare R2）（推奨）
   - content/配下に配置

---

## 参考リソース

### 参考プロジェクト
- [azukiazusa.dev (sapper-blog-app)](https://github.com/azukiazusa1/sapper-blog-app)

### remarkプラグイン
- [remark-link-card](https://www.npmjs.com/package/remark-link-card)
- [remark-alerts](https://www.npmjs.com/package/remark-alerts)
- [remark-gfm](https://www.npmjs.com/package/remark-gfm)

### Obsidian
- [Obsidian Documentation](https://help.obsidian.md/)

### Next.js + Markdown
- [unified](https://unifiedjs.com/)
