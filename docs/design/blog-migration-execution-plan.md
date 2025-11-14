# ブログ記事管理システム移行 実行計画書

## プロジェクト概要

**目的**: ブログシステムをMDX形式からMarkdown形式に移行し、Obsidianでの執筆を可能にする

**対象記事**: 全13記事（`src/content/blog/*.mdx`）

**移行方針**:
- 一括移行（整合性維持）
- 段階的実施（フェーズごとに検証）
- ロールバック可能（各フェーズ終了時にgitコミット）

---

## Phase 0: 意思決定

### 🎯 目的
要件定義書の意思決定項目を確定し、実装方針を決定する

### ✅ タスクリスト

- [ ] **LinkPreview実装方式の決定**
  - 選択肢A: remarkプラグイン活用（`remark-link-card`等）【推奨】
  - 選択肢B: カスタムremarkプラグイン開発
  - 選択肢C: 機能廃止
  - **決定**: ________________

- [ ] **フロントマター形式の決定**
  - 選択肢A: 現状維持（`title`, `date`, `description`, `tags`）【推奨】
  - 選択肢B: azukiazusa.dev形式（`id`, `slug`, `createdAt`, `updatedAt`, `published`）
  - **決定**: ________________

- [ ] **移行方式の決定**
  - 選択肢A: 一括移行（全記事を一度に変換・移行）【推奨】
  - 選択肢B: 段階的移行（新記事からMDで書き、既存記事は徐々に移行）
  - **決定**: ________________

- [ ] **画像管理方式の決定**
  - 選択肢A: 現状維持（Cloudflare R2 + CDN）【推奨】
  - 選択肢B: `content/`配下に画像も配置
  - **決定**: ________________

- [ ] 決定内容をADR（Architecture Decision Record）に記録

### 📋 成果物
- [ ] 意思決定の記録（ADR）
- [ ] Phase 1へ進む判断

---

## Phase 1: プロトタイプ検証

### 🎯 目的
サンプル記事1件でMDX→MD変換を試行し、技術的実現可能性を検証する

### ✅ タスクリスト

#### 1-1. サンプル記事の選定
- [ ] LinkPreview、Callout、Image全てを含む記事を選定
- [ ] 推奨記事: `add-blog-to-portfolio.mdx` を確認
- [ ] 選定した記事名を記録: ________________

#### 1-2. remarkプラグインの調査
- [ ] `remark-link-card`の調査
  - [ ] npmパッケージページで最終更新日を確認
  - [ ] GitHub issuesで互換性問題を検索
  - [ ] インストール: `pnpm add remark-link-card`
  - [ ] ドキュメントで設定方法を確認

- [ ] `remark-alerts`の調査
  - [ ] npmパッケージページで最終更新日を確認
  - [ ] インストール: `pnpm add remark-alerts`
  - [ ] ドキュメントで設定方法を確認

- [ ] `remark-unwrap-images`の調査
  - [ ] インストール: `pnpm add remark-unwrap-images`
  - [ ] ドキュメントで設定方法を確認

- [ ] その他必要なプラグイン
  - [ ] `remark-gfm`（GitHub Flavored Markdown）
  - [ ] `remark-breaks`（改行の扱い）

#### 1-3. 手動変換テスト
- [ ] `content/blog/`ディレクトリを作成: `mkdir -p content/blog`
- [ ] サンプル記事をコピー
- [ ] 拡張子を`.mdx`から`.md`に変更
- [ ] コンテンツを手動変換:
  - [ ] `<LinkPreview url='...' />` → `[リンクテキスト](URL)` に変換
  - [ ] `<Callout>...</Callout>` → `> [!NOTE]` に変換
  - [ ] `<Image>` → `![alt](url)` に変換
- [ ] フロントマターが正しく保持されているか確認

#### 1-4. ローカルビルド検証
- [ ] `src/lib/mdx.ts`を一時的に修正してMarkdown対応
- [ ] ビルド実行: `pnpm run build`
- [ ] エラーがある場合は記録して対処
- [ ] 開発サーバー起動: `pnpm run dev`
- [ ] ブラウザでサンプル記事にアクセス
- [ ] 表示確認:
  - [ ] タイトル、日付、タグが表示される
  - [ ] 本文が正しくレンダリングされる
  - [ ] LinkPreview機能が動作する
  - [ ] Callout機能が動作する
  - [ ] 画像が表示される

#### 1-5. Obsidian検証
- [ ] Obsidianアプリをインストール（未インストールの場合）
- [ ] Obsidianで`content/`フォルダをボルトとして開く
- [ ] サンプル記事がリスト表示されるか確認
- [ ] サンプル記事を開いてプレビュー確認
- [ ] GFM Alerts（`> [!NOTE]`）が表示されるか確認
- [ ] リンク、画像が正しく表示されるか確認

#### 1-6. 検証結果の評価
- [ ] 以下の判定基準を全て満たすか確認:
  - [ ] サンプル記事がビルド成功
  - [ ] ブログページで正しく表示される
  - [ ] Obsidianでプレビュー可能
  - [ ] remarkプラグインで機能が再現できる
- [ ] 問題があれば記録し、対策を検討
- [ ] Phase 2へ進むかロールバックするか判断

### 📋 成果物
- [ ] プロトタイプ検証レポート（検証結果、スクリーンショット）
- [ ] remarkプラグイン設定メモ
- [ ] Phase 2へ進む判断

---

## Phase 2: 変換ツール開発

### 🎯 目的
全13記事を自動変換するスクリプトを開発・実行する

### ✅ タスクリスト

#### 2-1. バックアップ作成
- [ ] 既存記事をバックアップ: `cp -r src/content/blog/ src/content/blog.backup/`
- [ ] gitコミット: `git add . && git commit -m "backup: before MDX to MD conversion"`

#### 2-2. 変換スクリプト開発
- [ ] `scripts/convert-mdx-to-md.ts`を作成
- [ ] 必要な依存パッケージをインストール:
  - [ ] `pnpm add -D gray-matter` (フロントマター処理)
  - [ ] `pnpm add -D glob` (ファイル検索)

- [ ] スクリプトの実装:
  - [ ] `src/content/blog/`から全`.mdx`ファイルを読み込む処理
  - [ ] gray-matterでフロントマターとコンテンツを分離
  - [ ] コンテンツ部分の変換（正規表現）:
    - [ ] `<LinkPreview url='...' />` → `[リンクテキスト](URL)`
    - [ ] `<Callout type="...">...</Callout>` → `> [!TYPE]\n> ...`
    - [ ] `<Image src='...' alt='...' />` → `![alt](src)`
  - [ ] `content/blog/`に`.md`として出力
  - [ ] 変換ログを出力（成功/失敗、変換箇所数）

#### 2-3. テスト実行（サンプル数件）
- [ ] スクリプトを2-3記事で試験実行
- [ ] 変換結果を確認:
  - [ ] ファイル数が一致
  - [ ] MDXコンポーネント構文が残っていない
  - [ ] フロントマターが正しく保持されている
  - [ ] 特殊文字・絵文字が文字化けしていない
- [ ] 問題があればスクリプトを修正

#### 2-4. 全記事変換実行
- [ ] `content/blog/`ディレクトリを作成: `mkdir -p content/blog`
- [ ] 変換スクリプト実行: `pnpm tsx scripts/convert-mdx-to-md.ts`
- [ ] 変換ログを確認
- [ ] 変換エラーがゼロであることを確認

#### 2-5. 変換結果の検証
- [ ] ファイル数確認:
  ```bash
  ls src/content/blog/*.mdx | wc -l  # 期待値: 13
  ls content/blog/*.md | wc -l        # 期待値: 13
  ```
- [ ] MDXコンポーネント構文が残っていないか確認:
  ```bash
  grep -r "<LinkPreview" content/blog/*.md  # ヒットしないこと
  grep -r "<Callout" content/blog/*.md      # ヒットしないこと
  grep -r "<Image " content/blog/*.md       # ヒットしないこと
  ```
- [ ] ランダムに5記事を開いてフロントマターと本文を目視確認

#### 2-6. gitコミット
- [ ] 変換結果をgit管理下に追加: `git add content/blog/`
- [ ] コミット: `git commit -m "chore: convert 13 MDX articles to Markdown"`

### 📋 成果物
- [ ] 変換スクリプト（`scripts/convert-mdx-to-md.ts`）
- [ ] 変換済みMarkdownファイル（`content/blog/*.md`）
- [ ] 変換ログ
- [ ] gitコミット

---

## Phase 3: ビルドシステム移行

### 🎯 目的
Next.jsのビルドシステムをMDX処理からMarkdown処理に移行する

### ✅ タスクリスト

#### 3-1. 依存パッケージの追加
- [ ] unifiedエコシステムのインストール:
  ```bash
  pnpm add unified remark-parse remark-rehype rehype-stringify
  ```
- [ ] remarkプラグインのインストール:
  ```bash
  pnpm add remark-gfm remark-breaks remark-link-card remark-alerts
  ```
- [ ] rehypeプラグインのインストール:
  ```bash
  pnpm add rehype-slug rehype-pretty-code
  ```
- [ ] 型定義のインストール:
  ```bash
  pnpm add -D @types/mdast @types/hast
  ```

#### 3-2. `src/lib/markdown.ts`の実装
- [ ] `src/lib/mdx.ts`をベースに`src/lib/markdown.ts`を新規作成
- [ ] 主な変更点を実装:
  - [ ] `blogDir`を`content/blog`に変更
  - [ ] ファイル検索を`.mdx`から`.md`に変更
  - [ ] `@mdx-js/mdx`の`evaluate`を削除
  - [ ] unifiedパイプラインでMarkdown処理を実装
  - [ ] remarkPluginsを設定: `[remarkGfm, remarkBreaks, remarkLinkCard, remarkAlerts]`
  - [ ] rehypePluginsを設定: `[rehypeSlug, rehypePrettyCode]`
- [ ] 既存の関数を移行:
  - [ ] `getAllPosts()`
  - [ ] `getPost(slug)`
  - [ ] `getPostSlugs()`
  - [ ] `getAllTags()`

#### 3-3. `src/components/feature/content/custom-mdx.tsx`の修正
- [ ] ファイル名を`custom-markdown.tsx`にリネーム（または内部ロジック修正）
- [ ] `@mdx-js/mdx`の`evaluate`を削除
- [ ] unifiedパイプラインでHTML生成に変更
- [ ] MDXComponentsの扱いを調整（remarkプラグインで処理）

#### 3-4. ページコンポーネントの修正
- [ ] `src/app/blog/[slug]/page.tsx`:
  - [ ] importパスを`@/lib/markdown`に変更
  - [ ] `getPost()`の呼び出しを確認
  - [ ] 型定義の調整

- [ ] `src/app/blog/page.tsx`:
  - [ ] importパスを`@/lib/markdown`に変更
  - [ ] `getAllPosts()`の呼び出しを確認

- [ ] `src/app/tags/[slug]/page.tsx`:
  - [ ] importパスを`@/lib/markdown`に変更
  - [ ] `getAllTags()`の呼び出しを確認

- [ ] `src/app/sitemap.ts`:
  - [ ] importパスを`@/lib/markdown`に変更
  - [ ] `getPostSlugs()`の呼び出しを確認

#### 3-5. `next.config.mjs`の修正
- [ ] `pageExtensions`を修正:
  ```javascript
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md'],
  ```

#### 3-6. ビルド確認
- [ ] 型チェック実行: `pnpm run typecheck`
  - [ ] エラーがある場合は修正
- [ ] Lint実行: `pnpm run lint`
  - [ ] エラーがある場合は修正
- [ ] ビルド実行: `pnpm run build`
  - [ ] エラーがある場合は修正
- [ ] 全てのチェックがパスするまで繰り返し

#### 3-7. gitコミット
- [ ] 変更をgit管理下に追加: `git add .`
- [ ] コミット:
  ```bash
  git commit -m "feat: migrate build system from MDX to Markdown

  - Add unified/remark/rehype processing pipeline
  - Replace @mdx-js/mdx with remark-link-card and remark-alerts
  - Update all page components to use new markdown lib
  - Update Next.js config for .md files"
  ```

### 📋 成果物
- [ ] `src/lib/markdown.ts`（新規）
- [ ] `src/components/feature/content/custom-markdown.tsx`（修正または新規）
- [ ] 各ページコンポーネントの修正
- [ ] `next.config.mjs`の修正
- [ ] ビルド成功の確認
- [ ] gitコミット

---

## Phase 4: テスト＆デプロイ

### 🎯 目的
変換後の記事が正しく表示されることを確認し、本番環境にデプロイする

### ✅ タスクリスト

#### 4-1. ローカル動作確認
- [ ] 開発サーバー起動: `pnpm run dev`
- [ ] 全13記事を個別に確認（チェックリスト）:
  1. [ ] 記事1: `___________________`
  2. [ ] 記事2: `___________________`
  3. [ ] 記事3: `___________________`
  4. [ ] 記事4: `___________________`
  5. [ ] 記事5: `___________________`
  6. [ ] 記事6: `___________________`
  7. [ ] 記事7: `___________________`
  8. [ ] 記事8: `___________________`
  9. [ ] 記事9: `___________________`
  10. [ ] 記事10: `___________________`
  11. [ ] 記事11: `___________________`
  12. [ ] 記事12: `___________________`
  13. [ ] 記事13: `___________________`

- [ ] 各記事で確認する項目:
  - [ ] タイトル、日付、タグが表示される
  - [ ] 本文が正しくレンダリングされる
  - [ ] LinkPreviewがカード形式で表示される
  - [ ] Calloutが適切なスタイルで表示される
  - [ ] 画像が表示される
  - [ ] 目次が生成される
  - [ ] コードブロックが正しく表示される

#### 4-2. タグ機能の確認
- [ ] 記事詳細ページでタグが表示される
- [ ] タグリンクをクリックして該当タグページに遷移できる
- [ ] タグページで記事一覧が表示される
- [ ] タグURLがslug形式になっている（例: `/tags/vscode`）

#### 4-3. ビルド確認
- [ ] プロダクションビルド実行: `pnpm run build`
- [ ] ビルドエラーがないことを確認
- [ ] プロダクションサーバー起動: `pnpm run start`
- [ ] ランダムに3記事を開いて表示確認

#### 4-4. Obsidian最終確認
- [ ] Obsidianで`content/`をボルトとして開く
- [ ] 全13記事がリスト表示されるか確認
- [ ] ランダムに5記事を開いてプレビュー確認:
  1. [ ] 記事: `___________________`
  2. [ ] 記事: `___________________`
  3. [ ] 記事: `___________________`
  4. [ ] 記事: `___________________`
  5. [ ] 記事: `___________________`
- [ ] GFM Alertsが適切に表示されるか確認
- [ ] リンク、画像が正しく表示されるか確認
- [ ] 新規記事を作成してテスト:
  - [ ] `content/blog/test-article.md`を作成
  - [ ] フロントマターを記載
  - [ ] Markdown記法で本文を執筆
  - [ ] 保存して編集可能か確認
  - [ ] 開発サーバーで表示確認
  - [ ] テスト記事を削除

#### 4-5. 静的解析実行
- [ ] 型チェック: `pnpm run typecheck`
- [ ] Lint: `pnpm run lint`
- [ ] タグチェック: `pnpm run check:tags`
- [ ] 全てのチェックがパスすることを確認

#### 4-6. SEO・パフォーマンス確認
- [ ] URLの変更がないか確認:
  ```bash
  curl -I http://localhost:3000/blog/add-blog-to-portfolio
  # 期待値: 200 OK（302リダイレクトではない）
  ```
- [ ] OGP画像が生成されるか確認:
  ```bash
  curl -I http://localhost:3000/blog/ogp/add-blog-to-portfolio
  # 期待値: 200 OK
  ```
- [ ] ページソースを表示して構造化データ（JSON-LD）を確認
  - [ ] `<script type="application/ld+json">`タグが存在する
  - [ ] 正しい構造化データが出力されている

- [ ] Chrome DevToolsのLighthouseで計測:
  - [ ] Performance スコア: ______ / 100（目標: 90以上）
  - [ ] Accessibility スコア: ______ / 100
  - [ ] Best Practices スコア: ______ / 100
  - [ ] SEO スコア: ______ / 100

#### 4-7. 最終gitコミット
- [ ] 未コミットの変更を確認: `git status`
- [ ] 必要な変更をステージング: `git add .`
- [ ] コミット:
  ```bash
  git commit -m "test: verify all blog articles after migration

  - Confirmed all 13 articles render correctly
  - Verified LinkPreview and Callout functionality
  - Tested Obsidian compatibility
  - All quality checks passed"
  ```

#### 4-8. プッシュ＆デプロイ
- [ ] リモートにプッシュ: `git push -u origin claude/create-execution-plan-01NdG7dnUQbUY32R4iTwK7Au`
- [ ] プッシュが成功したことを確認
- [ ] CIパイプラインが成功したことを確認（GitHub Actions等）
- [ ] 本番環境にデプロイ
- [ ] 本番環境で動作確認:
  - [ ] トップページにアクセス
  - [ ] ランダムに3記事を開いて表示確認
  - [ ] エラーがないか確認

#### 4-9. 移行後の監視（1週間）
- [ ] アクセス解析を監視（Google Analytics等）
- [ ] 検索流入の変動を確認
- [ ] エラーログを監視
- [ ] 問題があれば記録して対処

### 📋 成果物
- [ ] 全記事の動作確認完了
- [ ] Obsidian対応確認完了
- [ ] 静的解析パス
- [ ] パフォーマンス評価
- [ ] 本番環境デプロイ完了
- [ ] gitプッシュ完了

---

## ロールバック手順

### ロールバック条件
以下のいずれかに該当する場合、前フェーズまたは移行前に戻す：
- [ ] Phase 1で技術的実現可能性が確認できない
- [ ] Phase 2で変換エラーが多発する
- [ ] Phase 3でビルドエラーが解決できない
- [ ] Phase 4で重大な表示崩れ・機能不全が発生する

### ロールバック手順

#### gitコミット前の場合
```bash
git restore .
```

#### gitコミット後の場合
```bash
git revert <commit-hash>
```

#### 本番デプロイ後の場合
```bash
git revert <commit-hash>
git push origin claude/create-execution-plan-01NdG7dnUQbUY32R4iTwK7Au
```

#### バックアップからの復元
```bash
rm -rf src/content/blog/
cp -r src/content/blog.backup/ src/content/blog/
git add src/content/blog/
git commit -m "revert: rollback to MDX format"
```

---

## 移行後の運用

### 新規記事の作成方法

- [ ] Obsidianで`content/blog/`配下に新規`.md`ファイルを作成
- [ ] フロントマターを記載:
  ```markdown
  ---
  title: 記事タイトル
  date: 2025-11-14
  description: 記事の説明
  tags:
    - タグ1
    - タグ2
  ---
  ```
- [ ] Markdown記法で執筆
- [ ] gitコミット＆プッシュ

### 新しいタグを追加する場合

- [ ] `src/config/tag-slugs.ts`にマッピングを追加
- [ ] `pnpm run check:tags`で検証
- [ ] gitコミット

---

## チェックリスト進捗

- [ ] Phase 0: 意思決定 - 完了
- [ ] Phase 1: プロトタイプ検証 - 完了
- [ ] Phase 2: 変換ツール開発 - 完了
- [ ] Phase 3: ビルドシステム移行 - 完了
- [ ] Phase 4: テスト＆デプロイ - 完了

**最終完了日**: ____年____月____日

---

## 関連ドキュメント

- [README](./README.md) - 設計ドキュメント全体の概要
- [要件定義書](./blog-migration-requirements.md) - 移行の目的、現状、目標、要件
- [移行計画書](./blog-migration-plan.md) - 移行の実行計画、各フェーズの作業内容
- [リスク管理表](./blog-migration-risks.md) - 移行に伴うリスクと対策
- [受入基準書](./blog-migration-acceptance-criteria.md) - 移行完了の判定基準
