# ブログ記事管理システム移行 実行計画書

**文書番号**: PLAN-2025-001
**作成日**: 2025-11-14
**バージョン**: 1.0
**ステータス**: Draft

---

## 1. 移行概要

### 1.1 移行の目的
Obsidianでのブログ記事執筆を可能にするため、MDX形式からMarkdown形式へ移行する。

### 1.2 移行方針
- **一括移行**: 全13記事を一度に変換・移行（整合性維持のため）
- **段階的実施**: フェーズごとに検証を行い、問題があれば前フェーズに戻る
- **ロールバック可能**: 各フェーズ終了時にgitコミットし、問題時は巻き戻し可能にする

### 1.3 移行スケジュール

| フェーズ | 作業内容 | 想定工数 | 担当 |
|---------|---------|---------|------|
| Phase 0 | 意思決定・承認 | 1時間 | プロジェクトオーナー |
| Phase 1 | プロトタイプ検証 | 2時間 | 開発者 |
| Phase 2 | 変換ツール開発 | 3時間 | 開発者 |
| Phase 3 | ビルドシステム移行 | 4時間 | 開発者 |
| Phase 4 | テスト＆デプロイ | 2時間 | 開発者 |
| **合計** | | **12時間** | |

---

## 2. Phase 0: 意思決定・承認（1時間）

### 2.1 目的
要件定義書で挙げた意思決定項目を確定し、移行を承認する。

### 2.2 作業内容

#### タスク0-1: 意思決定の実施
以下の項目について決定を行う：

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

#### タスク0-2: 移行承認
- [ ] 要件定義書のレビュー
- [ ] 移行計画書の承認
- [ ] リスク管理表の確認

### 2.3 成果物
- 意思決定記録書（このドキュメントに追記）
- 承認済み要件定義書

---

## 3. Phase 1: プロトタイプ検証（2時間）

### 3.1 目的
サンプル記事1件でMDX→MD変換を試行し、技術的実現可能性を検証する。

### 3.2 作業内容

#### タスク1-1: サンプル記事の選定（5分）
- [ ] LinkPreview、Callout、Image全てを含む記事を選定
- 推奨: `add-blog-to-portfolio.mdx`（LinkPreviewが2箇所含まれる）

#### タスク1-2: 手動変換（30分）
- [ ] `.mdx` → `.md` に拡張子変更
- [ ] `<LinkPreview url='...' />` → `[リンクテキスト](URL)`に変換
- [ ] `<Callout>` → `> [!NOTE]`に変換（該当する場合）
- [ ] `<Image>` → `![alt](url)`に変換（該当する場合）

#### タスク1-3: remarkプラグイン調査（45分）
- [ ] `remark-link-card`の調査・インストール
- [ ] `remark-alerts`の調査・インストール
- [ ] `remark-unwrap-images`の調査（Next.js Image最適化用）
- [ ] 各プラグインの設定方法を確認

#### タスク1-4: ローカルビルド検証（30分）
- [ ] `content/blog/`ディレクトリを作成
- [ ] サンプル記事を`content/blog/`に配置
- [ ] `src/lib/mdx.ts`を一時的に修正してビルド試行
- [ ] remarkプラグインを適用してビルド成功を確認

#### タスク1-5: Obsidian検証（15分）
- [ ] Obsidianで`content/`をボルトとして開く
- [ ] サンプル記事がプレビューされることを確認
- [ ] GFM Alertsが表示されることを確認
- [ ] リンクが機能することを確認

### 3.3 成果物
- プロトタイプ検証レポート（検証結果をREADMEまたはissueに記載）
- remarkプラグイン設定メモ

### 3.4 判定基準
以下の全てを満たす場合、Phase 2へ進む：
- [ ] サンプル記事がビルド成功
- [ ] ブログページで正しく表示される
- [ ] Obsidianでプレビュー可能
- [ ] remarkプラグインで機能が再現できる

---

## 4. Phase 2: 変換ツール開発（3時間）

### 4.1 目的
全13記事を自動変換するスクリプトを開発する。

### 4.2 作業内容

#### タスク2-1: 変換スクリプトの設計（30分）
- [ ] 入力: `src/content/blog/*.mdx`
- [ ] 出力: `content/blog/*.md`
- [ ] 変換ロジックの設計書を作成

#### タスク2-2: 変換スクリプトの実装（1.5時間）
ファイル: `scripts/convert-mdx-to-md.ts`

**実装内容**:
```typescript
// 以下の変換を実装
// 1. ファイル拡張子の変更
// 2. <LinkPreview url='...' /> → [リンクテキスト](URL)
// 3. <Callout type="...">...</Callout> → > [!TYPE]\n> ...
// 4. <Image src='...' alt='...' /> → ![alt](src)
// 5. フロントマターの検証（形式チェック）
```

**処理フロー**:
1. `src/content/blog/`から全`.mdx`ファイルを読み込み
2. gray-matterでフロントマターとコンテンツを分離
3. コンテンツ部分を正規表現で変換
4. `content/blog/`に`.md`として出力
5. 変換ログを出力（変換箇所数、エラー等）

#### タスク2-3: 変換スクリプトのテスト（45分）
- [ ] サンプル記事でテスト実行
- [ ] 変換結果の目視確認
- [ ] 全13記事で実行してログ確認
- [ ] 変換漏れ・エラーがないか確認

#### タスク2-4: 変換スクリプトの実行（15分）
- [ ] `content/blog/`ディレクトリを作成
- [ ] 変換スクリプトを実行
- [ ] 変換ログを保存
- [ ] 変換結果をgitコミット（Phase 2完了時点）

### 4.3 成果物
- `scripts/convert-mdx-to-md.ts`
- 変換ログファイル
- `content/blog/*.md`（全13記事）

### 4.4 判定基準
- [ ] 全13記事が`.md`形式に変換されている
- [ ] MDXコンポーネント構文が残っていない
- [ ] フロントマターが正しく保持されている
- [ ] 変換エラーがゼロ

---

## 5. Phase 3: ビルドシステム移行（4時間）

### 5.1 目的
Next.jsのビルドシステムをMDX処理からMarkdown処理に移行する。

### 5.2 作業内容

#### タスク3-1: 依存パッケージの追加（15分）
```bash
pnpm add unified remark-parse remark-rehype rehype-stringify
pnpm add remark-link-card remark-alerts  # プラグイン
pnpm add -D @types/mdast  # 型定義
```

#### タスク3-2: `src/lib/markdown.ts`の実装（1.5時間）
`src/lib/mdx.ts`をベースに`src/lib/markdown.ts`を新規作成

**変更点**:
- `blogDir`を`content/blog`に変更
- `.mdx`ファイル検索を`.md`に変更
- `gray-matter`の使用は継続
- `@mdx-js/mdx`の使用を削除（unifiedに置き換え）

**実装内容**:
```typescript
// unified + remarkプラグインを使用したMarkdown処理
// remarkPlugins: [remarkGfm, remarkBreaks, remarkLinkCard, remarkAlerts]
// rehypePlugins: [rehypeSlug, rehypePrettyCode]
```

#### タスク3-3: `src/components/feature/content/custom-mdx.tsx`の修正（1時間）
ファイル名を`custom-markdown.tsx`にリネームするか、内部ロジックを修正

**変更点**:
- `@mdx-js/mdx`の`evaluate`を削除
- unifiedパイプラインを使用したHTML生成
- remarkプラグインの適用
- `components`プロップの処理を変更（Markdown→HTMLなので不要の可能性）

#### タスク3-4: `src/app/blog/[slug]/page.tsx`の修正（30分）
- [ ] `getAllBlogPosts`のimportパスを`@/lib/markdown`に変更
- [ ] `CustomMDX`コンポーネントのimportを更新
- [ ] 型定義を調整

#### タスク3-5: `next.config.mjs`の修正（15分）
```javascript
// pageExtensions から .mdx を削除、.md を追加（または.mdxを残して互換性維持）
pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md'],
```

#### タスク3-6: その他のファイル修正（30分）
- [ ] `src/app/sitemap.ts`: importパスを修正
- [ ] `src/app/blog/page.tsx`: importパスを修正
- [ ] `src/app/tags/[slug]/page.tsx`: importパスを修正
- [ ] 型定義ファイル（`src/types/mdx.ts`）の調整

### 5.3 成果物
- `src/lib/markdown.ts`
- 修正された`custom-markdown.tsx`（またはcustom-mdx.tsxの修正版）
- 修正された各ページコンポーネント
- 更新された`next.config.mjs`

### 5.4 判定基準
- [ ] `pnpm run build`が成功する
- [ ] 型エラーがゼロ
- [ ] Lintエラーがゼロ

---

## 6. Phase 4: テスト＆デプロイ（2時間）

### 6.1 目的
変換後の記事が正しく表示されることを確認し、本番環境にデプロイする。

### 6.2 作業内容

#### タスク4-1: ローカル動作確認（45分）
- [ ] `pnpm run dev`で開発サーバー起動
- [ ] 全13記事を個別に確認
  - [ ] LinkPreviewが表示されるか
  - [ ] Calloutが表示されるか
  - [ ] 画像が表示されるか
  - [ ] 目次が生成されるか
  - [ ] タグリンクが動作するか
- [ ] タグページが正しく動作するか
- [ ] ブログ一覧ページが正しく動作するか

#### タスク4-2: ビルド確認（15分）
- [ ] `pnpm run build`でプロダクションビルド
- [ ] ビルドエラーがないことを確認
- [ ] `pnpm run start`で本番モード起動
- [ ] 表示崩れがないか確認

#### タスク4-3: Obsidian最終確認（15分）
- [ ] Obsidianで`content/`をボルトとして開く
- [ ] 全記事がリスト表示されるか
- [ ] ランダムに数記事を開いてプレビュー確認
- [ ] 新規記事を作成してObsidianで編集可能か確認

#### タスク4-4: 型チェック＆Lint（15分）
```bash
pnpm run typecheck
pnpm run lint
pnpm run check:tags
```
- [ ] 全チェックがパスすることを確認

#### タスク4-5: gitコミット（15分）
```bash
git add .
git commit -m "feat: migrate blog system from MDX to Markdown for Obsidian support

- Move blog files from src/content/blog/ to content/blog/
- Convert .mdx to .md format (13 articles)
- Replace MDX components with remark/rehype plugins
  - LinkPreview: remark-link-card
  - Callout: remark-alerts
  - Image: standard Markdown
- Update build system to use unified + remark/rehype
- Add Obsidian vault support for content/ directory

BREAKING CHANGE: Blog articles are now in content/blog/ instead of src/content/blog/"
```

#### タスク4-6: プッシュ＆デプロイ（15分）
```bash
git push origin <branch-name>
```
- [ ] GitHub Actionsでビルド成功を確認
- [ ] Vercel/Cloudflare Pagesで自動デプロイ確認
- [ ] 本番URLで動作確認

### 6.3 成果物
- デプロイ済みの本番環境
- 動作確認レポート

### 6.4 判定基準
- [ ] 全記事が正しく表示される
- [ ] Obsidianで編集可能
- [ ] 本番環境でエラーがない
- [ ] ページ表示速度が許容範囲内（現状比150%以内）

---

## 7. ロールバック計画

### 7.1 ロールバック条件
以下のいずれかに該当する場合、前フェーズまたは移行前に戻す：
- Phase 1で技術的実現可能性が確認できない
- Phase 2で変換エラーが多発（10箇所以上）
- Phase 3でビルドエラーが解決できない
- Phase 4で重大な表示崩れ・機能不全が発生

### 7.2 ロールバック手順
```bash
# gitコミット前の場合
git restore .

# gitコミット後の場合
git revert <commit-hash>

# 最悪の場合（本番デプロイ後）
git revert <commit-hash>
git push origin <branch-name> --force
```

### 7.3 ロールバック影響
- `content/blog/`ディレクトリを削除
- `src/content/blog/`を復元
- `src/lib/mdx.ts`を復元
- `next.config.mjs`を復元

---

## 8. 移行後の運用

### 8.1 新規記事の作成方法
1. Obsidianで`content/blog/`配下に新規`.md`ファイルを作成
2. フロントマターを記載（テンプレート参照）
3. Markdown記法で執筆
4. gitコミット＆プッシュ

### 8.2 テンプレート
```markdown
---
title: 記事タイトル
date: 2025-11-14
description: 記事の説明
tags:
  - タグ1
  - タグ2
---

## 見出し

本文...
```

### 8.3 新しいタグを追加する場合
1. `src/config/tag-slugs.ts`にマッピングを追加
2. `pnpm run check:tags`で検証
3. gitコミット

---

## 9. 懸念事項

### 9.1 技術的懸念
- remarkプラグインが期待通り動作しない可能性
- unifiedパイプラインのパフォーマンス懸念
- Obsidianプラグインとの競合

### 9.2 運用的懸念
- 開発者がMarkdown記法に慣れる必要がある
- remarkプラグインの保守・更新コスト
- Obsidian設定ファイルのgit管理方針

---

## 10. 関連ドキュメント

- [要件定義書](./blog-migration-requirements.md)
- [リスク管理表](./blog-migration-risks.md)
- [受入基準書](./blog-migration-acceptance-criteria.md)

---

## 11. 承認履歴

| 日付 | 承認者 | ステータス | 備考 |
|------|--------|-----------|------|
| 2025-11-14 | - | Draft | 初版作成 |
| - | - | - | 意思決定後に承認予定 |

---

## 12. 変更履歴

| バージョン | 日付 | 変更内容 | 変更者 |
|-----------|------|---------|--------|
| 1.0 | 2025-11-14 | 初版作成 | Claude Code |
