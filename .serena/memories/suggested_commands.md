# よく使うコマンド

## 開発
```bash
# 開発サーバー起動
bun run dev

# ビルド (静的生成)
bun run build

# プレビュー (ビルド後)
bun run start
```

## コード品質チェック (タスク完了時に実行)

### フォーマット
```bash
# フォーマット実行 (Biome + Prettier)
bun run format

# フォーマットチェックのみ
bun run format:check

# Prettier単体 (Astroファイルのみ)
bun run prettier
bun run prettier:check
```

### Lint
```bash
# Lint実行
bun run lint

# Lint + 自動修正
bun run lint:fix

# Lint + 自動修正 (unsafe)
bun run lint:unsafe-fix

# AI用Lint (GitHub Actionsフォーマット出力)
bun run lint:ai
```

### 型チェック
```bash
# 型チェック (Astro + TypeScript)
bun run type-check

# AI用型チェック (シンプル出力)
bun run type-check:ai

# Astro単体チェック
bun run astro-check
```

### 統合チェック
```bash
# Biome check (format + lint統合)
bun run check

# Biome check + 自動修正
bun run check:fix

# Biome CI (変更ファイルのみ)
bun run ci
```

## ブログ記事管理

```bash
# 新規ブログテンプレート作成
bun run new-blog

# タグ整合性チェック
bun run check:tags

# ブログアイコン更新
bun run update-blog-icon

# URL前後の空行チェック
bun run check:url-blank-lines

# URL前後の空行自動修正
bun run fix:url-blank-lines
```

## セキュリティチェック

```bash
# SVGセキュリティチェック (ステージングファイル)
bun run check:svg-security

# SVGセキュリティチェック (全ファイル)
bun run check:svg-security:all
```

## テスト・パフォーマンス

```bash
# Lighthouse CI
bun run lhci:healthcheck
bun run lhci:astro      # ビルド + 収集
bun run lhci:assert     # アサーション
bun run lhci:upload     # アップロード
bun run lhci:open       # 結果表示
```

## テキスト校正 (contentsディレクトリ)

```bash
# textlint実行
bun run textlint

# textlint + 自動修正
bun run textlint:fix
```

## Git Hooks

```bash
# Huskyセットアップ
bun run prepare
```

## Darwin (macOS) システムコマンド

標準的なUnixコマンドが使用可能:
- `git`: バージョン管理
- `ls`: ファイル一覧
- `cd`: ディレクトリ移動
- `grep`: テキスト検索
- `find`: ファイル検索
- `cat`: ファイル表示
- `mkdir`: ディレクトリ作成
- `rm`: ファイル削除
- `cp`: ファイルコピー
- `mv`: ファイル移動
