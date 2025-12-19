# タスク完了時のチェックリスト

## 必須実行項目

タスク完了後、以下のコマンドを**必ず順番に実行**してください。

### 1. フォーマットチェック
```bash
bun run format
```
- Biome + Prettierで全ファイルをフォーマット
- Astroファイルも含む

### 2. 型チェック
```bash
bun run type-check:ai
```
- Astro + TypeScriptの型チェック
- AI用の簡潔な出力形式

### 3. Lint
```bash
bun run lint:ai
```
- Biomeによる静的解析
- GitHub Actionsフォーマットで出力

## オプション項目

### ブログ記事編集時
- **タグ追加時**: `bun run check:tags`
- **SVG追加時**: `bun run check:svg-security`
- **URL記述時**: `bun run check:url-blank-lines`
- **textlint**: `bun run textlint` (contentsディレクトリ)

### ビルド確認
```bash
bun run build
```
- 本番ビルドが成功することを確認
- Pagefindインデックスも自動生成される

## pre-commitフック自動実行内容

コミット時に自動実行される項目:
1. **SVGセキュリティチェック** (SVGファイル変更時)
2. **ブログアイコン変換** (Markdownファイル変更時)
3. **タグ整合性チェック** (Markdownファイル変更時)
4. **textlint** (Markdownファイル変更時、自動修正あり)

## エラー時の対処

### フォーマットエラー
```bash
bun run format
```
で自動修正

### Lintエラー
```bash
bun run lint:fix
```
で自動修正 (unsafeな修正が必要な場合は `lint:unsafe-fix`)

### 型エラー
手動で修正が必要

### タグエラー
`src/config/tag-slugs.ts` に未登録のタグを追加

## 推奨順序

1. コード修正
2. `bun run format`
3. `bun run type-check:ai`
4. `bun run lint:ai`
5. エラーがあれば修正して2-4を繰り返す
6. コミット (pre-commitフックが自動実行)
