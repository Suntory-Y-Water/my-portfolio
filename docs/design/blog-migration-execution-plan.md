# ブログ記事管理システム移行 実行計画書

## プロジェクト概要

**目的**: ブログシステムをMDX形式からMarkdown形式に移行し、Obsidianでの執筆を可能にする

**対象**: 全13記事（`src/content/blog/*.mdx`）

**方針**: 一括移行、段階的検証、各フェーズ終了時にコミット

---

## Phase 0: 意思決定

### 決定事項
- [x] **LinkPreview実装**: remarkプラグイン活用
- [x] **フロントマター**: 現状維持
- [x] **移行方式**: 一括移行
- [x] **画像管理**: Cloudflare R2維持
- [x] 意思決定を記録（`blog-migration-decisions.md`）

---

## Phase 1: プロトタイプ検証

### ゴール
サンプル記事1件でMDX→MD変換を試行し、技術的実現可能性を確認

### タスク
- [x] remarkプラグイン（remark-link-card, remark-github-blockquote-alert）の互換性調査
- [x] サンプル記事を手動変換（`response-header-web-check-list.md`）
- [x] remarkプラグインの動作テスト
- [x] 実現可能性の判断（Go）

### 判定基準
- [x] remarkプラグインが基本的に動作する
- [x] GFM Alertsが変換される
- [x] unifiedエコシステムとの互換性確認
- [x] ~~remark-link-cardはネットワークエラー~~ → カスタムrehype-link-card実装で解決

---

## Phase 2: 変換ツール開発

### ゴール
全13記事を自動変換するスクリプトを開発・実行

### タスク
- [x] バックアップ作成（`src/content/blog.backup/`）
- [x] 変換スクリプト開発（`scripts/convert-mdx-to-md.ts`）
- [x] 3記事でテスト実行して動作確認
- [x] 全13記事を変換実行（LinkPreview: 44, Callout: 3）
- [x] 変換結果を検証

### 判定基準
- [x] 変換エラーがゼロ（13/13成功）
- [x] フロントマター保持
- [x] MDXコンポーネント構文が除去されている

---

## Phase 3: ビルドシステム移行

### ゴール
Next.jsのビルドシステムをMarkdown処理に移行

### タスク
- [x] 依存パッケージ追加（unified, remark-*, rehype-*）
- [x] `src/lib/markdown.ts`実装（`mdx.ts`をベースに作成）
- [x] コンポーネント修正（`custom-mdx.tsx` → `custom-markdown.tsx`）
- [x] ページコンポーネント修正（全ファイル`@/lib/mdx` → `@/lib/markdown`）
- [x] `next.config.mjs`修正（既に.md対応済み）
- [x] 型チェック・Lintパス
- [x] フロントマター形式保持の修正

### 判定基準
- [x] `pnpm run typecheck`パス
- [x] `pnpm run lint`パス
- [x] カスタムrehype-link-card実装（`src/lib/rehype-link-card.ts`）
- [x] allowDangerousHtml設定で静的HTML生成
- [ ] ビルドテストは本番環境で確認

---

## Phase 4: テスト＆デプロイ

### ゴール
変換後の記事が正しく表示されることを確認し、本番環境にデプロイ

### タスク
- [x] ローカルで全13記事の表示確認（LinkPreview, Callout, 画像, 目次）
- [ ] リンクカードのレイアウト最終調整（元のlink-preview.tsxと完全一致）
- [ ] コードブロックのコピーボタン実装（クライアントサイドまたはrehypeプラグイン）
- [ ] Obsidian最終確認（ボルトとして開く、プレビュー、新規記事作成テスト）
- [x] 静的解析（typecheck, lint, check:tags）
- [ ] SEO・パフォーマンス確認（URL維持、OGP、JSON-LD、Lighthouse）
- [ ] 本番環境へデプロイ

### 判定基準
- [x] 全記事が基本表示される
- [x] リンクカードがOG情報を表示（レイアウト微調整中）
- [ ] リンクカードが元のLinkPreviewと視覚的に一致
- [ ] コードブロックにコピーボタンがある
- [ ] Obsidianで編集可能
- [x] 静的解析パス
- [ ] Lighthouse Performance 90以上
- [ ] URL変更なし

---

## ロールバック

### 条件
- Phase 1: 技術的実現不可
- Phase 2: 変換エラー多発
- Phase 3: ビルドエラー解決不可
- Phase 4: 重大な表示崩れ・機能不全

### 手順
```bash
# コミット前
git restore .

# コミット後
git revert <commit-hash>

# バックアップから復元
cp -r src/content/blog.backup/ src/content/blog/
```

---

## 移行後の運用

### 新規記事作成
Obsidianで`content/blog/`に`.md`ファイルを作成、フロントマター記載、執筆、コミット

### 新規タグ追加
`src/config/tag-slugs.ts`に追加 → `pnpm run check:tags` → コミット

---

## 進捗

- [x] Phase 0: 意思決定
- [x] Phase 1: プロトタイプ検証
- [x] Phase 2: 変換ツール開発
- [x] Phase 3: ビルドシステム移行
- [~] Phase 4: テスト＆デプロイ（レイアウト調整中）

**最終更新**: 2025-11-14 (Session: claude/create-execution-plan-01NdG7dnUQbUY32R4iTwK7Au)

---

## 関連ドキュメント

- [要件定義書](./blog-migration-requirements.md)
- [移行計画書](./blog-migration-plan.md)
- [リスク管理表](./blog-migration-risks.md)
- [受入基準書](./blog-migration-acceptance-criteria.md)
