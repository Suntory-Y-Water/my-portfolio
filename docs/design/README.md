# ブログ記事管理システム移行 設計ドキュメント

このディレクトリには、ブログ記事管理システムのMDX→Markdown移行に関する設計ドキュメントが格納されています。

## 📁 ドキュメント一覧

### 1. [要件定義書](./blog-migration-requirements.md)
**文書番号**: REQ-2025-001

移行の目的、機能要件、非機能要件、意思決定が必要な項目を定義しています。

**主な内容**:
- プロジェクト概要とスコープ
- 機能要件（FR-01〜FR-05）
- 非機能要件（NFR-01〜NFR-04）
- 意思決定項目（LinkPreview実装方式、フロントマター形式等）

---

### 2. [移行計画書](./blog-migration-plan.md)
**文書番号**: PLAN-2025-001

移行の実行計画、各フェーズの作業内容、スケジュールを記載しています。

**主な内容**:
- Phase 0: 意思決定・承認（1時間）
- Phase 1: プロトタイプ検証（2時間）
- Phase 2: 変換ツール開発（3時間）
- Phase 3: ビルドシステム移行（4時間）
- Phase 4: テスト＆デプロイ（2時間）

**合計工数**: 約12時間

---

### 3. [リスク管理表](./blog-migration-risks.md)
**文書番号**: RISK-2025-001

移行に伴うリスクとその対策を記載しています。

**主なリスク**:
- 🔴 クリティカル: remarkプラグインの互換性問題、一括変換時のデータ損失、ビルドエラーの解決不能
- 🟡 重要: パフォーマンス劣化、Obsidianとの互換性問題、SEO影響
- 🟢 注意: 既存記事の表示崩れ、新規タグの追加漏れ
- 🔵 監視: remarkプラグインの非推奨化

---

### 4. [受入基準書](./blog-migration-acceptance-criteria.md)
**文書番号**: ACC-2025-001

移行完了の判定基準を記載しています。

**主な基準**:
- ファイル配置（AC-001〜AC-002）
- コンテンツ変換（AC-003〜AC-004）
- ビルド＆デプロイ（AC-005〜AC-007）
- 機能動作（AC-008〜AC-012）
- Obsidian対応（AC-013〜AC-015）
- SEO＆パフォーマンス（AC-016〜AC-019）

**合計**: 21項目の受入基準

---

## 📊 ギャップ分析サマリー

### 現状（AS-IS）
- **配置**: `src/content/blog/*.mdx`
- **形式**: MDX形式
- **コンポーネント**: `<LinkPreview>`（46箇所）、`<Callout>`（8箇所）、`<Image>`（11箇所）
- **Obsidian対応**: 不可

### 理想（TO-BE）
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

## 🎯 意思決定が必要な項目（Phase 0）

以下の項目について、実装前に決定が必要です：

### 🔴 クリティカル（実装前に決定必須）

1. **LinkPreview実装方式**
   - [ ] remarkプラグイン活用（推奨）
   - [ ] カスタムremarkプラグイン開発
   - [ ] 機能廃止

2. **フロントマター形式**
   - [ ] 現状維持（推奨）
   - [ ] azukiazusa.dev形式

3. **移行方式**
   - [ ] 一括移行（推奨）
   - [ ] 段階的移行

4. **画像管理方式**
   - [ ] 現状維持（Cloudflare R2）（推奨）
   - [ ] content/配下に画像も配置

---

## 🚀 次のステップ

### 1. 意思決定の実施
- [ ] プロジェクトオーナーに要件定義書をレビュー依頼
- [ ] 意思決定項目について議論・決定
- [ ] 移行計画書を承認

### 2. Phase 1の準備
- [ ] プロトタイプ検証環境の準備
- [ ] remarkプラグインの事前調査
- [ ] サンプル記事の選定

### 3. キックオフ
- [ ] 開発者への要件説明
- [ ] リスク管理体制の確立
- [ ] Phase 1の開始

---

## 📞 問い合わせ

このドキュメントに関する質問や懸念事項がある場合は、以下に連絡してください：

- **プロジェクトオーナー**: （記載してください）
- **技術リーダー**: （記載してください）
- **ドキュメント作成者**: Claude Code

---

## 📅 更新履歴

| 日付 | 変更内容 | 変更者 |
|------|---------|--------|
| 2025-11-14 | 初版作成（全4ドキュメント＋README） | Claude Code |

---

## 📚 関連リソース

### 参考プロジェクト
- [azukiazusa.dev (sapper-blog-app)](https://github.com/azukiazusa1/sapper-blog-app)

### remarkプラグイン
- [remark-link-card](https://www.npmjs.com/package/remark-link-card)
- [remark-alerts](https://www.npmjs.com/package/remark-alerts)
- [remark-gfm](https://www.npmjs.com/package/remark-gfm)

### Obsidian
- [Obsidian Documentation](https://help.obsidian.md/)
- [Obsidian Community Plugins](https://obsidian.md/plugins)

### Next.js + Markdown
- [Next.js Markdown Guide](https://nextjs.org/docs/app/building-your-application/configuring/mdx)
- [unified](https://unifiedjs.com/)
