# タスク完了時のチェックリスト

このファイルは、コード実装後に必ず実行すべきチェック項目をまとめたものです。

## 必須チェック項目

### 1. 型チェック
```bash
bun run typecheck
```

**確認内容:**
- TypeScript型エラーがゼロであること
- すべてのファイルが正しく型付けされていること

**エラーが出た場合:**
- `mcp__ide__getDiagnostics`で詳細確認
- 型定義を修正して再実行

---

### 2. Lint + フォーマットチェック
```bash
bun run check
```

または、型チェックとLintを一括で実行する場合：
```bash
bun run ai-check
```

**確認内容:**
- Biome Lintエラーがゼロであること
- フォーマットが統一されていること
- コーディング規約に準拠していること

**主なチェック項目:**
- `noExplicitAny`: `any`型を使用していないか
- `noImplicitAnyLet`: 暗黙の`any`型がないか
- `noEvolvingTypes`: 型の進化がないか
- インポートの整理
- クォートスタイル(シングルクォート)
- セミコロンの有無
- トレーリングカンマ

**エラーが出た場合:**
```bash
# 自動修正を試みる
bun run check:fix

# 修正後、再度チェック
bun run check
```

---

### 3. ブログ記事を更新した場合: textlint
ブログ記事(`contents/blog/*.md`)を更新した場合のみ実行：

```bash
bun run textlint
```

**確認内容:**
- 日本語の文章校正がパスすること
- textlintルールに準拠していること

**エラーが出た場合:**
```bash
# 自動修正を試みる
bun run textlint:fix

# 修正後、再度チェック
bun run textlint
```

**主なtextlintチェック項目:**
- 文章の長さ
- 句読点の使い方
- 技術用語の表記統一
- 禁則処理
- 二重否定の回避

---

### 4. ビルド確認
```bash
bun run build
```

**確認内容:**
- ビルドが成功すること
- ビルドエラー・警告がないこと
- 生成されたファイルが正常であること

**ビルド後の自動実行:**
- Pagefindの検索インデックス生成(`postbuild`スクリプト)

**エラーが出た場合:**
- エラーメッセージを詳細に確認
- 必要に応じて実装を修正
- 再度ビルドを実行

---

## 追加チェック項目(状況に応じて)

### SVGファイルを追加・更新した場合
```bash
# 変更されたSVGファイルのみチェック
bun run check:svg-security

# すべてのSVGファイルをチェック
bun run check:svg-security:all
```

### タグを追加・更新した場合
```bash
bun run check:tags
```

### URLを含むMarkdownを編集した場合
```bash
# URL周辺の空行チェック
bun run check:url-blank-lines

# 自動修正
bun run fix:url-blank-lines --apply
```

---

## チェック完了後の流れ

### すべてのチェックがパスした場合
1. 変更内容を確認
```bash
git status
git diff
```

2. ステージング
```bash
git add .
```

3. コミット
```bash
git commit -m "type: description"
```

**コミットメッセージのフォーマット:**
- `feat:` - 新機能
- `fix:` - バグ修正
- `refactor:` - リファクタリング
- `docs:` - ドキュメント更新
- `test:` - テスト追加・修正
- `style:` - スタイル修正
- `chore:` - その他の変更

4. プッシュ
```bash
git push origin <branch-name>
```

### Huskyによる自動チェック

`git commit`時に以下が自動実行されます(pre-commitフック)：

1. **SVGセキュリティチェック**(変更されたSVGファイルのみ)
2. **ブログアイコン自動変換**(変更されたブログファイルのみ)
3. **タグ整合性チェック**
4. **textlint**(日本語校正、自動修正あり)

これらのチェックが失敗するとコミットが中断されるため、事前に手動でチェックしておくことを推奨します。

---

## クイックリファレンス

### 最小限のチェック(すべてのタスク)
```bash
bun run ai-check  # 型チェック + Lint
bun run build     # ビルド確認
```

### ブログ記事更新時の完全チェック
```bash
bun run ai-check           # 型チェック + Lint
bun run textlint           # 日本語校正
bun run check:tags         # タグ整合性
bun run build              # ビルド確認
```

---

## トラブルシューティング

### ビルドエラーが発生した場合
1. エラーメッセージを詳細に確認
2. `mcp__ide__getDiagnostics`で型エラーの詳細を取得
3. 必要に応じて実装を修正
4. 再度チェックを実行

### Lintエラーが多数ある場合
```bash
# 自動修正を試みる
bun run check:fix

# 修正後、再度チェック
bun run check
```

### textlintエラーが多数ある場合
```bash
# 自動修正を試みる
bun run textlint:fix

# 修正後、再度チェック
bun run textlint
```

---

## まとめ

タスク完了時には、以下の順序でチェックを実行してください：

1. ✅ **型チェック** (`bun run typecheck`)
2. ✅ **Lint + フォーマット** (`bun run check`)
3. ✅ **textlint**(ブログ記事更新時のみ)
4. ✅ **ビルド確認** (`bun run build`)

すべてのチェックがパスしたら、コミット・プッシュを実行してください。
