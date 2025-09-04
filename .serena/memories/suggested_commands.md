# 推奨コマンド

## 開発コマンド

### 基本的な開発フロー
```bash
# 開発サーバー起動
pnpm dev

# プロダクションビルド
pnpm build

# プロダクションサーバー起動
pnpm start
```

### コード品質チェック
```bash
# AI用統合チェック（型チェック + リント）
pnpm run ai-check

# 型チェック
pnpm run typecheck

# リント
pnpm run lint

# リント自動修正
pnpm run lint:fix

# フォーマット
pnpm run format

# フォーマットチェック
pnpm run format:check
```

### ユーティリティ
```bash
# クリーンアップ（.next/とnode_modules/を削除）
pnpm run clean

# バンドル分析
pnpm run analyze
```

## Git関連
```bash
# 基本的なGitコマンド
git status
git add .
git commit -m "message"
git push

# ブランチ操作
git branch
git checkout -b new-branch
git merge branch-name
```

## システムコマンド（Linux）
```bash
# ファイル・ディレクトリ操作
ls -la
find . -name "pattern"
grep -r "search-term" .
cd directory
pwd
```

## 重要な注意事項
- コード変更後は必ず `pnpm run ai-check` を実行する
- CLAUDE.mdの指針に従って開発を行う
- TypeScriptの型保証を活用し、重複チェックを避ける