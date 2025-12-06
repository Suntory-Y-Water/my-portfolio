# 推奨コマンド一覧

## 開発時に頻繁に使用するコマンド

### 開発サーバー
```bash
# 開発サーバー起動
bun run dev

# 本番ビルド + プレビュー
bun run preview
```

### ビルド
```bash
# 本番ビルド
bun run build

# ビルド後にPagefindの検索インデックスも生成される（postbuild）
# pagefind --site .next --output-path public/pagefind

# 本番サーバー起動
bun run start
```

### コード品質チェック（必須）

#### 型チェック
```bash
# TypeScript型チェック
bun run typecheck
```

#### Lintとフォーマット
```bash
# Biome Lint実行
bun run lint

# Lint自動修正
bun run lint:fix

# Lint unsafe修正（慎重に）
bun run lint:unsage-fix

# Biomeフォーマット
bun run format

# フォーマットチェックのみ
bun run format:check

# Biome統合チェック（lintとformatを統合）
bun run check

# Biome統合チェック + 自動修正
bun run check:fix
```

#### CI用チェック
```bash
# CI環境用の厳密チェック
bun run ci

# AI開発時の推奨チェック（型チェック + Biome統合チェック）
bun run ai-check
```

### ブログ記事関連

#### 記事作成
```bash
# 新しいブログ記事テンプレート作成（自動でブランチ作成される）
bun run new-blog
```

#### 記事の検証
```bash
# タグ整合性チェック
bun run check:tags

# SVGセキュリティチェック（変更されたファイルのみ）
bun run check:svg-security

# SVGセキュリティチェック（全ファイル）
bun run check:svg-security:all

# URL周辺の空行チェック
bun run check:url-blank-lines

# URL周辺の空行自動修正
bun run fix:url-blank-lines --apply

# ブログアイコンの更新
bun run update-blog-icon
```

#### textlint（日本語校正）
```bash
# textlint実行
bun run textlint

# textlint自動修正
bun run textlint:fix
```

### バンドル分析
```bash
# Webpackバンドル分析
bun run analyze

# JSON形式でバンドル分析結果を出力
bun run analyze:json
```

### クリーンアップ
```bash
# ビルド成果物とnode_modulesを削除
bun run clean
```

### Kiri MCP（コードベース検索）
```bash
# Kiriインデックス作成・監視モード
bun run kiri
```

## タスク完了時に実行すべきコマンド

以下のコマンドは、コード実装後に必ず実行してください：

```bash
# 1. 型チェック
bun run typecheck

# 2. Lint + フォーマット統合チェック
bun run check

# または、AIチェックコマンドで一括実行
bun run ai-check

# 3. （記事を更新した場合）textlint
bun run textlint

# 4. ビルド確認
bun run build
```

## Darwin（macOS）システムコマンド

### ファイル・ディレクトリ操作
```bash
# ファイル一覧
ls -la

# ディレクトリ移動
cd <path>

# ファイル検索（名前）
find . -name "pattern"

# テキスト検索（内容）
grep -r "pattern" .
```

### Git操作
```bash
# 状態確認
git status

# 差分確認
git diff

# ステージング
git add .

# コミット
git commit -m "message"

# プッシュ
git push origin <branch-name>

# ブランチ作成・切り替え
git checkout -b <branch-name>

# ログ確認
git log --oneline
```

### GitHub CLI（gh）
```bash
# PR作成
gh pr create --title "title" --body "description"

# PR確認
gh pr view <pr-number>

# PR一覧
gh pr list

# Issue一覧
gh issue list
```

## Husky（Gitフック）

pre-commitフックで以下が自動実行されます：

1. **SVGセキュリティチェック**（変更されたSVGファイルのみ）
2. **ブログアイコン自動変換**（変更されたブログファイルのみ）
3. **タグ整合性チェック**
4. **textlint**（日本語校正、自動修正あり）

これらのチェックが失敗するとコミットが中断されます。
