# ブログ記事管理システム移行 実行計画

## 移行方針

- **一括移行**: 全13記事を一度に変換・移行（整合性維持）
- **段階的実施**: フェーズごとに検証し、問題があれば前フェーズに戻る
- **ロールバック可能**: 各フェーズ終了時にgitコミット

## 実行フェーズ

### Phase 0: 意思決定

要件定義書の意思決定項目を確定：

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

### Phase 1: プロトタイプ検証

**目的**: サンプル記事1件でMDX→MD変換を試行し、技術的実現可能性を検証

#### 手順

1. **サンプル記事の選定**
   - LinkPreview、Callout、Image全てを含む記事を選定
   - 推奨: `add-blog-to-portfolio.mdx`

2. **手動変換**
   - `.mdx` → `.md` に拡張子変更
   - `<LinkPreview url='...' />` → `[リンクテキスト](URL)`
   - `<Callout>` → `> [!NOTE]`
   - `<Image>` → `![alt](url)`

3. **remarkプラグイン調査**
   - `remark-link-card`の調査・インストール
   - `remark-alerts`の調査・インストール
   - `remark-unwrap-images`の調査
   - 各プラグインの設定方法を確認

4. **ローカルビルド検証**
   ```bash
   mkdir -p content/blog
   # サンプル記事を配置
   # src/lib/mdx.tsを一時修正
   pnpm run build
   ```

5. **Obsidian検証**
   - Obsidianで`content/`をボルトとして開く
   - サンプル記事のプレビュー確認
   - GFM Alerts表示確認

#### 判定基準
以下を満たす場合、Phase 2へ進む：
- サンプル記事がビルド成功
- ブログページで正しく表示される
- Obsidianでプレビュー可能
- remarkプラグインで機能が再現できる

---

### Phase 2: 変換ツール開発

**目的**: 全13記事を自動変換するスクリプトを開発

#### 変換スクリプト仕様

**ファイル**: `scripts/convert-mdx-to-md.ts`

**処理フロー**:
1. `src/content/blog/`から全`.mdx`ファイルを読み込み
2. gray-matterでフロントマターとコンテンツを分離
3. コンテンツ部分を正規表現で変換：
   - `<LinkPreview url='...' />` → `[リンクテキスト](URL)`
   - `<Callout type="...">...</Callout>` → `> [!TYPE]\n> ...`
   - `<Image src='...' alt='...' />` → `![alt](src)`
4. `content/blog/`に`.md`として出力
5. 変換ログを出力

#### 実行

```bash
mkdir -p content/blog
pnpm tsx scripts/convert-mdx-to-md.ts
git add content/blog/
git commit -m "chore: convert MDX to Markdown"
```

#### 判定基準
- 全13記事が`.md`形式に変換されている
- MDXコンポーネント構文が残っていない
- フロントマターが正しく保持されている
- 変換エラーがゼロ

---

### Phase 3: ビルドシステム移行

**目的**: Next.jsのビルドシステムをMDX処理からMarkdown処理に移行

#### 依存パッケージ追加

```bash
pnpm add unified remark-parse remark-rehype rehype-stringify
pnpm add remark-link-card remark-alerts
pnpm add -D @types/mdast
```

#### 実装内容

1. **`src/lib/markdown.ts`の実装**
   - `src/lib/mdx.ts`をベースに新規作成
   - `blogDir`を`content/blog`に変更
   - `.mdx` → `.md`ファイル検索に変更
   - unifiedパイプラインを使用したMarkdown処理
   - remarkPlugins: `[remarkGfm, remarkBreaks, remarkLinkCard, remarkAlerts]`
   - rehypePlugins: `[rehypeSlug, rehypePrettyCode]`

2. **`src/components/feature/content/custom-mdx.tsx`の修正**
   - `custom-markdown.tsx`にリネーム（または内部ロジック修正）
   - `@mdx-js/mdx`の`evaluate`を削除
   - unifiedパイプラインでHTML生成

3. **各ページコンポーネントの修正**
   - `src/app/blog/[slug]/page.tsx`
   - `src/app/blog/page.tsx`
   - `src/app/tags/[slug]/page.tsx`
   - `src/app/sitemap.ts`
   - importパスを`@/lib/markdown`に変更

4. **`next.config.mjs`の修正**
   ```javascript
   pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md'],
   ```

#### 判定基準
- `pnpm run build`が成功する
- 型エラーがゼロ
- Lintエラーがゼロ

---

### Phase 4: テスト＆デプロイ

**目的**: 変換後の記事が正しく表示されることを確認し、本番環境にデプロイ

#### 動作確認

1. **ローカル確認**
   ```bash
   pnpm run dev
   ```
   - 全13記事を個別に確認
   - LinkPreview表示確認
   - Callout表示確認
   - 画像表示確認
   - 目次生成確認
   - タグリンク動作確認

2. **ビルド確認**
   ```bash
   pnpm run build
   pnpm run start
   ```

3. **Obsidian最終確認**
   - Obsidianで`content/`をボルトとして開く
   - 全記事がリスト表示されるか確認
   - ランダムに数記事を開いてプレビュー確認
   - 新規記事を作成してテスト

4. **静的解析**
   ```bash
   pnpm run typecheck
   pnpm run lint
   pnpm run check:tags
   ```

#### デプロイ

```bash
git add .
git commit -m "feat: migrate blog system from MDX to Markdown

- Move blog files from src/content/blog/ to content/blog/
- Convert .mdx to .md format (13 articles)
- Replace MDX components with remark/rehype plugins
- Add Obsidian vault support"

git push origin <branch-name>
```

#### 判定基準
- 全記事が正しく表示される
- Obsidianで編集可能
- 本番環境でエラーがない

---

## ロールバック手順

### ロールバック条件
以下のいずれかに該当する場合、前フェーズまたは移行前に戻す：
- Phase 1で技術的実現可能性が確認できない
- Phase 2で変換エラーが多発
- Phase 3でビルドエラーが解決できない
- Phase 4で重大な表示崩れ・機能不全が発生

### 手順

```bash
# gitコミット前
git restore .

# gitコミット後
git revert <commit-hash>

# 本番デプロイ後
git revert <commit-hash>
git push origin <branch-name>
```

---

## 移行後の運用

### 新規記事の作成方法

1. Obsidianで`content/blog/`配下に新規`.md`ファイルを作成
2. フロントマターを記載：
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
3. Markdown記法で執筆
4. gitコミット＆プッシュ

### 新しいタグを追加する場合

1. `src/config/tag-slugs.ts`にマッピングを追加
2. `pnpm run check:tags`で検証
3. gitコミット

---

## 関連ドキュメント

- [要件定義書](./blog-migration-requirements.md)
- [リスク管理表](./blog-migration-risks.md)
- [受入基準書](./blog-migration-acceptance-criteria.md)
