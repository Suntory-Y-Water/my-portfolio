# ブログ記事管理システム移行 実行計画書

## プロジェクト概要

**目的**: ブログシステムをMDX形式からMarkdown形式に移行し、Obsidianでの執筆を可能にする

**対象**: 全13記事（`src/content/blog/*.mdx`）

**方針**: 一括移行、段階的検証、各フェーズ終了時にコミット

---

## Phase 0: 意思決定

### 決定事項
- [ ] **LinkPreview実装**: remarkプラグイン活用 / カスタム開発 / 廃止
- [ ] **フロントマター**: 現状維持 / azukiazusa.dev形式
- [ ] **移行方式**: 一括移行 / 段階的移行
- [ ] **画像管理**: Cloudflare R2維持 / content/配下に配置
- [ ] ADRに記録

---

## Phase 1: プロトタイプ検証

### ゴール
サンプル記事1件でMDX→MD変換を試行し、技術的実現可能性を確認

### タスク
- [ ] remarkプラグイン（remark-link-card, remark-alerts）の互換性調査
- [ ] サンプル記事を手動変換してローカルビルド検証
- [ ] Obsidianでプレビュー確認
- [ ] 実現可能性の判断（Go/No-Go）

### 判定基準
- サンプル記事がビルド成功
- ブログページで正しく表示
- Obsidianでプレビュー可能
- remarkプラグインで機能再現できる

---

## Phase 2: 変換ツール開発

### ゴール
全13記事を自動変換するスクリプトを開発・実行

### タスク
- [ ] バックアップ作成（`src/content/blog.backup/`）
- [ ] 変換スクリプト開発（`scripts/convert-mdx-to-md.ts`）
- [ ] 2-3記事でテスト実行して動作確認
- [ ] 全13記事を変換実行
- [ ] 変換結果を検証（MDXコンポーネント構文が残っていないこと）

### 判定基準
- 変換エラーがゼロ
- フロントマター保持
- MDXコンポーネント構文が除去されている

---

## Phase 3: ビルドシステム移行

### ゴール
Next.jsのビルドシステムをMarkdown処理に移行

### タスク
- [ ] 依存パッケージ追加（unified, remark-*, rehype-*）
- [ ] `src/lib/markdown.ts`実装（`mdx.ts`をベースに作成）
- [ ] コンポーネント修正（`custom-mdx.tsx` → `custom-markdown.tsx`）
- [ ] ページコンポーネント修正（blog/[slug], blog, tags/[slug], sitemap）
- [ ] `next.config.mjs`修正（pageExtensionsに.md追加）
- [ ] ビルド・型チェック・Lintが全てパス

### 判定基準
- `pnpm run build`成功
- `pnpm run typecheck`パス
- `pnpm run lint`パス

---

## Phase 4: テスト＆デプロイ

### ゴール
変換後の記事が正しく表示されることを確認し、本番環境にデプロイ

### タスク
- [ ] ローカルで全13記事の表示確認（LinkPreview, Callout, 画像, 目次）
- [ ] Obsidian最終確認（ボルトとして開く、プレビュー、新規記事作成テスト）
- [ ] 静的解析（typecheck, lint, check:tags）
- [ ] SEO・パフォーマンス確認（URL維持、OGP、JSON-LD、Lighthouse）
- [ ] 本番環境へデプロイ

### 判定基準
- 全記事が正しく表示
- Obsidianで編集可能
- 静的解析パス
- Lighthouse Performance 90以上
- URL変更なし

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

- [ ] Phase 0: 意思決定
- [ ] Phase 1: プロトタイプ検証
- [ ] Phase 2: 変換ツール開発
- [ ] Phase 3: ビルドシステム移行
- [ ] Phase 4: テスト＆デプロイ

完了日: ____________

---

## 関連ドキュメント

- [要件定義書](./blog-migration-requirements.md)
- [移行計画書](./blog-migration-plan.md)
- [リスク管理表](./blog-migration-risks.md)
- [受入基準書](./blog-migration-acceptance-criteria.md)
