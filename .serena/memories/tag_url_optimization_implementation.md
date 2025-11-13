# タグURL最適化 実装報告書

## 実装日
2025-11-13

## 目的
日本語タグやスペースを含むタグがGoogle Search Consoleでインデックスされない問題を解決するため、タグURLをslug形式（英語・小文字・ハイフン区切り）に変換。

## 実装概要

### 問題
- 現状: `/tags/Visual Studio Code` → `/tags/Visual%20Studio%20Code`（URLエンコード）
- 問題: 日本語タグ（例: `/tags/アクセシビリティ`）がインデックスされない
- 原因: URLエンコード後の文字列が長く複雑

### 解決策
- タグ名→slug変換マッピングテーブルの導入
- URL: `/tags/vscode`, `/tags/accessibility`（英語slug）
- 画面表示: "Visual Studio Code", "アクセシビリティ"（日本語）

---

## 実装内容

### 1. マッピングテーブル作成
**ファイル**: `src/config/tag-slugs.ts`

```typescript
export const TAG_SLUG_MAP: Record<string, string> = {
  'Claude': 'claude',
  'GitHub Copilot': 'github-copilot',
  'Visual Studio Code': 'vscode',
  // ... 全23タグ
  'セキュリティ': 'security',
  'ブログ': 'blog',
  '絵文字': 'emoji',
};

export function getTagSlug(tagName: string): string
export function getTagNameFromSlug(slug: string): string | undefined
```

**機能**:
- タグ名→slug変換
- slug→タグ名逆引き
- フォールバック用の自動slug化関数

---

### 2. MDXタグ取得関数の修正
**ファイル**: `src/lib/mdx.ts`

**追加関数**:
```typescript
export async function getAllTagSlugs(): Promise<string[]>
```
- タグ名をslugに変換して返す

**修正関数**:
```typescript
export async function getBlogPostsByTagSlug(tagSlug: string): Promise<BlogPost[]>
```
- slugからタグ名を逆引きして記事をフィルタ

---

### 3. タグページの修正
**ファイル**: `src/app/tags/[slug]/page.tsx`

**変更点**:
- URLパラメータをslugとして受け取る
- `getTagNameFromSlug()`で日本語タグ名を取得
- メタデータ・OGPに日本語タグ名を使用

**動作**:
- URL: `/tags/vscode`
- 表示: "Visual Studio Code タグの記事一覧"

---

### 4. sitemap.ts の修正
**ファイル**: `src/app/sitemap.ts`

**変更点**:
```typescript
const tagSlugs = await getAllTagSlugs();
const tagEntries = tagSlugs.map((slug) => ({
  url: `${baseUrl}/tags/${slug}`,
}));
```

---

### 5. タグ一覧ページの修正
**ファイル**: `src/app/tags/page.tsx`

**変更点**:
```typescript
<Link href={`/tags/${getTagSlug(tag)}`}>
```
- タグ名からslugを生成してリンク

---

### 6. タグ整合性チェックスクリプト
**ファイル**: `scripts/check-tags.ts`

**機能**:
- MDXファイル内の全タグをスキャン
- マッピングテーブルに未登録のタグを検出
- 終了コード: 0=正常, 1=エラー

**実行方法**:
```bash
pnpm check:tags
```

**CI/CD統合**: `.github/workflows/ci.yml`に追加済み

---

## 実装結果

### タグ一覧（全23個）
```
Claude, ClaudeCode, Cloudflare, Cloudflare Workers, DevConatainers,
Docker, GitHub, GitHub Copilot, Hono, HonoX, LINE Messaging API,
MCP, Next.js, Notion, OpenNext.js, React, Tailwind CSS, Vercel,
Visual Studio Code, セキュリティ, ブログ, ポートフォリオ, 絵文字
```

### slug変換例
| タグ名 | slug |
|--------|------|
| Visual Studio Code | vscode |
| GitHub Copilot | github-copilot |
| セキュリティ | security |
| ブログ | blog |

---

## 未完了の作業

### ⚠️ blog-card.tsx のタグリンク修正

**問題**:
- ネストされたLink（カード内にタグLink）がビルドエラー
- エラー: `Event handlers cannot be passed to Client Component props`

**原因**:
- Server ComponentからClient Component propsに`onClick`を渡せない

**解決策（未実装）**:
1. タグリンクをClient Componentに分離
2. または、カード全体を`<article>`に変更してタグだけをLinkに

**現状**:
- タグはBadgeで表示のみ（リンクなし）
- `getTagSlug`のimportが未使用警告

---

## テスト結果

### ✅ タグ整合性チェック
```bash
$ pnpm check:tags
✅ 全てのタグがマッピングテーブルに登録されています！
```

### ✅ 型チェック
```bash
$ pnpm typecheck
✅ パス
```

### ✅ Lint
```bash
$ pnpm lint
✅ パス
```

### ❌ ビルド
```bash
$ pnpm build
❌ エラー: blog-card.tsxのネストされたLink問題
```

---

## 次のステップ

1. **blog-card.tsxの修正**
   - タグリンク機能の復元
   - ネストされたLink問題の解決

2. **ビルド確認**
   - `pnpm build`が成功することを確認

3. **コミット・プッシュ**
   ```bash
   git add .
   git commit -m "feat: implement tag slug optimization for SEO"
   git push
   ```

4. **デプロイ後の確認**
   - タグURLが英語slugになっているか確認
   - Google Search Consoleでインデックス状況を監視

---

## 技術的な決定

### なぜマッピングテーブルを選択したか

**検討した選択肢**:
1. フロントマターに手動記載（`tags`と`tag_slugs`）
2. マッピングテーブル（`src/config/tag-slugs.ts`）
3. 自動slug化のみ

**選択**: マッピングテーブル

**理由**:
- 日本語→英語変換が確実
- 新タグ追加時にCI/CDで自動チェック
- 一元管理で保守性が高い

### sapper-blog-appとの比較

**sapper-blog-app**:
- Contentful CMSでslug管理
- CMSのコンテンツタイプとして定義

**本プロジェクト**:
- Obsidian運用（content/blog/配下にMDファイル）
- マッピングテーブル + CI/CDチェック

---

## 参考資料

- メモリ: `seo_improvements` - SEO改善点リスト
- メモリ: `seo_tag_url_issue` - タグURL最適化詳細
- 参考サイト: https://azukiazusa.dev (sapper-blog-app)

---

## 注意事項

### 新しいタグを追加する場合

1. `src/config/tag-slugs.ts`にマッピングを追加
2. `pnpm check:tags`でチェック
3. CI/CDで自動的にバリデーション

**例**:
```typescript
'新しいタグ': 'new-tag',
```

### content/blog/への移行

**現状**: `src/content/blog/`にMDXファイル配置
**将来**: `content/blog/`へ移行予定（別タスク）

---

## まとめ

タグURL最適化の実装は**95%完了**。残りはblog-card.tsxのタグリンク修正のみ。

全体として、SEO改善のための重要な基盤が整備され、今後のタグ管理が自動化・効率化された。
