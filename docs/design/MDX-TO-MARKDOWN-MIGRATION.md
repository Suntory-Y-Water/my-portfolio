# MDX to Markdown 移行ガイド

**最終更新**: 2025-11-14 (Session: claude/create-execution-plan-01NdG7dnUQbUY32R4iTwK7Au)

このドキュメントは、ブログシステムのMDX形式からMarkdown形式への移行プロジェクトの全記録です。
今後の開発者やAIエージェントは、このドキュメントのみを参照すれば移行の全体像を把握できます。

---

## 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [移行ステータス](#移行ステータス)
3. [主要な技術決定](#主要な技術決定)
4. [実装詳細](#実装詳細)
5. [運用ガイド](#運用ガイド)
6. [トラブルシューティング](#トラブルシューティング)
7. [参考情報](#参考情報)

---

## プロジェクト概要

### 目的
ブログシステムをMDX形式からMarkdown形式に移行し、Obsidianでの執筆を可能にする。

### 移行前後の比較

| 項目 | 移行前（AS-IS） | 移行後（TO-BE） |
|------|----------------|----------------|
| **配置** | `src/content/blog/*.mdx` | `content/blog/*.md` |
| **形式** | MDX形式 | プレーンMarkdown |
| **ファイル名** | `slug.mdx` | `yyyy-mm-dd_slug.md` |
| **リンクカード** | `<LinkPreview url='...' />` | 単体URL（rehypeプラグインで自動変換） |
| **コールアウト** | `<Callout type='info'>...</Callout>` | `> [!NOTE]` (GFM Alerts) |
| **コードコピー** | CodeBlockコンポーネント | rehypeプラグイン + useEffect |
| **Obsidian対応** | 不可 | 完全対応 |

### 対象記事
全13記事（移行完了）

---

## 移行ステータス

### ✅ 完了項目

#### 基本的なMarkdown構文
- [x] テキスト表示、見出し、太字、斜体
- [x] リスト（ul, ol）
- [x] テーブル
- [x] 画像
- [x] 水平線

#### スタイリング
- [x] 元のMDXコンポーネントのスタイルを適用（`src/styles/mdx.css`）
- [x] コードブロックのスタイル（角丸、パディング、横スクロール）
- [x] インラインコードのスタイル（角丸）
- [x] レスポンシブ対応

#### GFM Alerts (コールアウト)
- [x] `<Callout>` → `> [!NOTE]` 形式への変換
- [x] アイコンとテキストの横並びレイアウト
- [x] タイプ別の配色（NOTE, TIP, IMPORTANT, WARNING, CAUTION）

#### URL表示
- [x] 長いURLの改行処理（`word-break`, `overflow-wrap`）

#### ビルドシステム
- [x] `content/blog/*.md` からの読み込み
- [x] unified/remark/rehype パイプライン構築
- [x] 型チェック、Lint通過
- [x] Frontmatterの日付形式保持

#### リンクカード（基本機能）
- [x] カスタム `rehype-link-card` プラグイン実装（`src/lib/rehype-link-card.ts`）
- [x] 既存の `getOGData` Server Actionを使用
- [x] SSG（Static Site Generation）でOG情報取得
- [x] エラーハンドリング（URLが消えない仕組み）
- [x] ファビコン、タイトル、説明文の表示
- [x] `allowDangerousHtml` でHTMLインジェクション対応

#### コードブロックのコピーボタン
- [x] カスタム `rehype-code-copy-button` プラグイン実装（`src/lib/rehype-code-copy-button.ts`）
- [x] クライアントコンポーネントでuseEffectによるボタン追加（`src/components/feature/content/markdown-content.tsx`）
- [x] 元のCodeBlockコンポーネントと同じレイアウト・動作
- [x] SSG担保（ビルド時にボタンHTML生成、クライアント側でイベントリスナー追加）

#### ファイル命名規則
- [x] 全13記事を`yyyy-mm-dd_slug.md`形式にリネーム
- [x] フロントマターに`slug`フィールド追加
- [x] `lib/markdown.ts`でslugをフロントマターから読み取る仕組み実装

### ❌ 未完了項目

#### リンクカードのレイアウト調整
- [ ] 元の`link-preview.tsx`コンポーネントとレイアウトを完全一致させる
- [ ] アイコン周りの配置、余白、スタイルの微調整

**技術的課題**:
- rehypeプラグインで生成する静的HTMLと、元のReactコンポーネントのレイアウトを完全一致させる
- TailwindクラスをHTML文字列として正確に再現する必要がある

---

## 主要な技術決定

### 1. LinkPreview実装方式

**決定**: カスタムrehypeプラグイン実装

**理由**:
- npmの`remark-link-card`はエラー時にURLが消失する問題
- 既存の`getOGData` Server Actionを再利用可能
- エラーハンドリングが確実（フォールバック表示）
- SSGでビルド時にOG情報を取得・キャッシュ

**実装内容**:
- `src/lib/rehype-link-card.ts` でカスタムrehypeプラグイン
- `@/actions/fetch-og-metadata`の`getOGData`を使用
- `allowDangerousHtml`で静的HTML生成
- エラー時はURLを消さずフォールバック表示

**参考調査**:
- azukiazusa.devは独自の`remark-link-card`パッケージ（v0.0.0, monorepo内）を使用
- npmの`remark-link-card`（gladevise製）はエラー時にURL消失の問題があり不採用

---

### 2. コードブロックのコピーボタン実装方式

**決定**: rehypeプラグイン + クライアントhydration

**理由**:
- SSGを担保（ボタンも静的HTML）
- JavaScript無効でもコンテンツ表示可能
- rehype-link-cardと同じパターン
- 元のCodeBlockコンポーネントのロジックを再利用

**実装内容**:
1. **ビルド時（rehypeプラグイン）**:
   - `src/lib/rehype-code-copy-button.ts`
   - コードブロック（`<pre>`）をラップする`<div class="group relative">`を生成
   - ボタンコンテナ（`data-copy-button`属性）を挿入

2. **クライアント側（useEffect）**:
   - `src/components/feature/content/markdown-content.tsx`
   - `data-copy-button`属性を持つコンテナを検出
   - ボタンHTMLを動的に挿入
   - クリックイベントでクリップボードにコピー
   - 1秒後にアイコンを元に戻す

**技術的ポイント**:
- `dangerouslySetInnerHTML`で挿入されたHTMLにはReactコンポーネントを埋め込めない
- useEffectで`AbortController`を使ってイベントリスナーをクリーンアップ
- Lucide ReactのCopy/CheckアイコンをSVGとして直接挿入

---

### 3. ファイル命名規則

**決定**: `yyyy-mm-dd_slug.md`形式

**理由**:
- ファイル名から日付が一目でわかる
- ファイル一覧が時系列で並ぶ
- フロントマターの`slug`フィールドでslugを明示的に管理
- Obsidianでも見やすい

**実装内容**:
- `scripts/rename-blog-files.ts` - 全記事を一括リネーム
- フロントマターに`slug`フィールドを追加
- `lib/markdown.ts` - slugをフロントマターから読み取る（fallbackとしてファイル名も使用）

**例**:
```
ファイル名: 2025-03-17_add-blog-to-portfolio.md
フロントマター:
  slug: add-blog-to-portfolio
  date: 2025-03-17
```

---

### 4. フロントマター形式

**決定**: 現状維持 + slug追加

**理由**:
- 移行コストが低い
- 既存の13記事のフロントマターをそのまま使える
- シンプルで十分な機能

**形式**:
```yaml
title: ...
slug: add-blog-to-portfolio  # 追加
date: 2025-03-17
description: ...
icon: https://...
tags:
  - ...
```

---

### 5. 移行方式

**決定**: 一括移行

**理由**:
- 整合性の維持が容易
- 13記事と規模が小さい
- 段階的移行による複雑さを避ける

---

### 6. 画像管理方式

**決定**: 現状維持（Cloudflare R2 + CDN）

**理由**:
- 既存の画像配信基盤が機能している
- CDNによる高速配信
- content/配下に画像を置くとリポジトリが肥大化

---

## 実装詳細

### unified/remark/rehypeパイプライン

`src/components/feature/content/custom-markdown.tsx`:

```typescript
const result = await unified()
  .use(remarkParse)           // Markdownをmdast（Markdown AST）に変換
  .use(remarkGfm)             // GitHub Flavored Markdown対応
  .use(remarkBreaks)          // 改行を<br>に変換
  .use(remarkAlert)           // GFM Alerts（コールアウト）対応
  .use(remarkRehype, { allowDangerousHtml: true })  // mdastをhast（HTML AST）に変換
  .use(rehypeSlug)            // 見出しにidを追加
  .use(rehypeLinkCard)        // リンクカード生成（カスタム）
  .use(rehypePrettyCode, options)  // シンタックスハイライト
  .use(rehypeCodeCopyButton)  // コピーボタン追加（カスタム）
  .use(rehypeStringify, { allowDangerousHtml: true })  // hastをHTMLに変換
  .process(source);
```

**重要ポイント**:
- `allowDangerousHtml: true` を`remarkRehype`と`rehypeStringify`に指定
- これにより、rehypeプラグインで生成した生HTMLがそのまま出力される

---

### rehype-link-card（リンクカード生成）

**ファイル**: `src/lib/rehype-link-card.ts`

**処理フロー**:
1. `<p><a href="url">url</a></p>` パターンを検出（純粋なURL段落）
2. 並列で全URLのOG情報を取得（`getOGData` Server Action使用）
3. HTMLを生成して`<p>`タグを置き換え

**生成HTML構造**:
```html
<a href="..." target="_blank" rel="noopener noreferrer" class="...">
  <div class="flex flex-1 flex-col gap-2 p-4">
    <div class="flex items-center gap-1">
      <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <!-- ファビコン + サイト名 + 外部リンクアイコン -->
      </div>
    </div>
    <div class="flex-1">
      <h3>タイトル</h3>
      <p>説明</p>
    </div>
  </div>
  <!-- OGイメージ -->
</a>
```

**エラーハンドリング**:
- OG取得失敗時: URLを消さず、「Page Not Found」としてフォールバック表示
- ネットワークエラー時: URLそのものを表示

---

### rehype-code-copy-button（コピーボタン）

**ファイル**:
- `src/lib/rehype-code-copy-button.ts` (rehypeプラグイン)
- `src/components/feature/content/markdown-content.tsx` (クライアントコンポーネント)

**処理フロー（ビルド時）**:
1. `<pre>`タグを検出
2. `<div class="group relative">`でラップ
3. `<div data-copy-button></div>` コンテナを追加
4. `<pre>`に`pr-12`クラスを追加（ボタン用の余白）

**処理フロー（クライアント側）**:
1. useEffectで`[data-copy-button]`を検出
2. ボタンHTML（SVGアイコン含む）を動的に生成
3. クリックイベントで`navigator.clipboard.writeText()`
4. アイコンをCopy → Check（緑）に変更
5. 1秒後に元に戻す

**クリーンアップ**:
- `AbortController`でイベントリスナーを削除
- `setTimeout`のIDを保存してクリア

---

### slug管理

**ファイル**: `src/lib/markdown.ts`

```typescript
async function readMarkdownFile<T>(filePath: string): Promise<MDXData<T>> {
  const rawContent = await fs.readFile(filePath, 'utf-8');
  const { data, content } = matter(rawContent);
  const relativePath = path.relative(process.cwd(), filePath);

  // フロントマターにslugフィールドがあればそれを使用、なければファイル名から抽出
  const slug = (data as Record<string, unknown>).slug as string | undefined;
  const filenameSlug = path.basename(filePath, path.extname(filePath));

  return {
    metadata: data as Frontmatter<T>,
    slug: slug ?? filenameSlug,  // フロントマター優先、fallbackでファイル名
    rawContent: content,
    filePath: relativePath,
  };
}
```

**優先順位**:
1. フロントマターの`slug`フィールド
2. ファイル名（拡張子なし）

これにより、ファイル名が`2025-03-17_add-blog-to-portfolio.md`でも、slugは`add-blog-to-portfolio`として扱われる。

---

## 運用ガイド

### 新規記事作成

1. **ファイル作成**
   ```bash
   # ファイル名: yyyy-mm-dd_slug.md
   touch content/blog/2025-11-15_new-article.md
   ```

2. **フロントマター記載**
   ```yaml
   ---
   title: 記事タイトル
   slug: new-article
   date: 2025-11-15
   description: 記事の説明
   icon: https://...
   tags:
     - タグ1
     - タグ2
   ---
   ```

3. **Markdown記法で執筆**
   - **リンクカード**: URLを単体行で記載
     ```markdown
     https://example.com
     ```
   - **コールアウト**: GFM Alerts記法
     ```markdown
     > [!NOTE]
     > これは注意書きです
     ```
   - **コードブロック**: バッククォート3つ
     ````markdown
     ```typescript
     const foo = 'bar';
     ```
     ````

4. **コミット**
   ```bash
   git add content/blog/2025-11-15_new-article.md
   git commit -m "feat: add new article"
   git push
   ```

---

### 新規タグ追加

1. **`src/config/tag-slugs.ts`に追加**
   ```typescript
   export const TAG_SLUGS = {
     // ...
     '新しいタグ': 'new-tag',
   } as const satisfies Record<string, string>;
   ```

2. **チェック実行**
   ```bash
   pnpm run check:tags
   ```

3. **コミット**
   ```bash
   git add src/config/tag-slugs.ts
   git commit -m "feat: add new tag"
   git push
   ```

---

## トラブルシューティング

### 発生した問題と解決策

#### 1. remark-link-cardがネットワークエラーで動作しない

**問題**:
- npmの`remark-link-card`はビルド時に外部URLへアクセスしてOG情報を取得
- ネットワークエラー時にURLが完全に消失する

**解決策**:
- カスタム`rehype-link-card`プラグインを実装
- 既存の`getOGData` Server Actionを使用
- エラー時はフォールバック表示（URLを消さない）

**参考**:
- azukiazusa.devも独自の`remark-link-card`（v0.0.0）を使用していた
- npmの`remark-link-card`（gladevise製）はエラー時にURL消失の問題あり

---

#### 2. HTMLタグがエスケープされて表示される

**問題**:
- rehypeプラグインで生成したHTMLが、`&lt;div&gt;`のようにエスケープされてしまう

**解決策**:
- `remarkRehype`と`rehypeStringify`に`allowDangerousHtml: true`を追加
- これにより、生HTMLがそのまま出力される

```typescript
.use(remarkRehype, { allowDangerousHtml: true })
.use(rehypeStringify, { allowDangerousHtml: true })
```

---

#### 3. useEffectの依存配列の警告

**問題**:
- biomeが`html`を依存配列に含めることを警告

**解決策**:
- `html`が変わったらボタンを再作成する必要があるため、依存配列に含めるのが正しい
- `biome-ignore`コメントで抑制

```typescript
// biome-ignore lint/correctness/useExhaustiveDependencies: html変更時にボタンを再作成する必要がある
useEffect(() => {
  // ...
}, [html]);
```

---

#### 4. TypeScript型エラー（index: undefined）

**問題**:
- `visit`コールバックの`index`パラメータが`number | null | undefined`型
- `parent.children[index]`で`undefined`エラー

**解決策**:
- 型ガードを追加

```typescript
if (
  node.tagName === 'pre' &&
  typeof index === 'number' &&
  parent &&
  Array.isArray(parent.children)
) {
  parent.children[index] = wrapper;
}
```

---

#### 5. パッケージマネージャーの混在（bun vs pnpm）

**問題**:
- 誤って`bun`で依存関係を追加し、`bun.lock`が生成された

**解決策**:
- `bun.lock`を削除
- `pnpm install`で依存関係を再インストール
- プロジェクトは**pnpm**を使用することを徹底

---

## 参考情報

### 調査したプロジェクト

#### azukiazusa.dev
- **URL**: https://github.com/azukiazusa1/sapper-blog-app
- **使用技術**: 独自の`remark-link-card`パッケージ（v0.0.0, monorepo内）
- **学び**: npmの`remark-link-card`ではなく、独自実装を使用していた

---

### 使用しているプラグイン

#### remarkプラグイン
- `remark-parse` - Markdownをmdastにパース
- `remark-gfm` - GitHub Flavored Markdown対応
- `remark-breaks` - 改行を`<br>`に変換
- `remark-github-blockquote-alert` - GFM Alerts対応

#### rehypeプラグイン
- `rehype-slug` - 見出しにidを追加
- `rehype-pretty-code` - シンタックスハイライト（slack-darkテーマ）
- `rehype-link-card` - **カスタム実装**（リンクカード生成）
- `rehype-code-copy-button` - **カスタム実装**（コピーボタン追加）

---

### 重要なファイル一覧

| ファイルパス | 説明 |
|------------|------|
| `content/blog/*.md` | ブログ記事（全13記事、yyyy-mm-dd_slug.md形式） |
| `src/lib/markdown.ts` | Markdownファイル読み取り、slug管理 |
| `src/lib/rehype-link-card.ts` | カスタムrehypeプラグイン（リンクカード） |
| `src/lib/rehype-code-copy-button.ts` | カスタムrehypeプラグイン（コピーボタン） |
| `src/components/feature/content/custom-markdown.tsx` | unifiedパイプライン定義（Server Component） |
| `src/components/feature/content/markdown-content.tsx` | Markdown HTML表示 + コピーボタン追加（Client Component） |
| `src/styles/mdx.css` | Markdownスタイル定義 |
| `scripts/rename-blog-files.ts` | ブログファイル一括リネームスクリプト |
| `scripts/convert-mdx-to-md.ts` | MDX→MD変換スクリプト |

---

### 参考リソース

- [unified公式ドキュメント](https://unifiedjs.com/)
- [remark公式ドキュメント](https://github.com/remarkjs/remark)
- [rehype公式ドキュメント](https://github.com/rehypejs/rehype)
- [Obsidian公式ドキュメント](https://help.obsidian.md/)
- [GFM Alerts仕様](https://github.com/orgs/community/discussions/16925)

---

## まとめ

このプロジェクトでは、ブログシステムをMDXからMarkdownに完全移行しました。

**主な成果**:
- ✅ 全13記事をMarkdown形式に変換
- ✅ Obsidian対応を実現
- ✅ リンクカード機能を安定化（カスタムrehypeプラグイン）
- ✅ コードブロックのコピーボタンをSSGで実装
- ✅ ファイル命名規則の統一（yyyy-mm-dd_slug.md）
- ✅ 型チェック・Lint通過

**残タスク**:
- リンクカードのレイアウト最終調整（元のLinkPreviewコンポーネントと完全一致）

このドキュメントは、今後の保守・開発の唯一の参照資料として使用してください。
