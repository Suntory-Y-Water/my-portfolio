# ブログ記事管理システム移行 リスク管理

## クリティカルリスク

### remarkプラグインの互換性問題

**リスク内容**:
- `remark-link-card`が期待通りに動作しない
- プラグイン同士の競合が発生する
- Next.js 15系との互換性がない

**影響**:
- LinkPreview機能が実装できない
- Phase 1で検証が失敗
- 移行計画の変更が必要

**予防策**:

```bash
# プラグインの最終更新日を確認
npm info remark-link-card
npm info remark-alerts

# GitHub issuesで互換性問題を検索
```

**代替案**:
1. カスタムremarkプラグインの開発
2. 既存のLinkPreviewコンポーネントロジックの抽出
3. rehypeプラグインでの実装検討

**発生時の対応**:
- Phase 1のプロトタイプ検証で早期発見
- 代替プラグインの調査（`remark-embed`, `remark-oembed`等）
- カスタムプラグイン開発への切り替え

---

### 一括変換時のデータ損失

**リスク内容**:
- 変換スクリプトのバグで記事内容が破損する
- フロントマターが消失する
- 特殊文字・絵文字が文字化けする

**影響**:
- 記事が読めなくなる
- SEOメタデータが失われる
- ロールバックが必要

**予防策**:

```bash
# 変換前にバックアップ作成
cp -r src/content/blog/ src/content/blog.backup/
git commit -m "backup: before MDX to MD conversion"
```

**段階的検証**:
1. サンプル1記事で検証
2. 2-3記事で検証
3. 全記事で実行

**変換後の検証**:
```bash
# ファイル数確認
ls src/content/blog/*.mdx | wc -l  # 13
ls content/blog/*.md | wc -l        # 13（同数か確認）

# フロントマター検証
pnpm run check:frontmatter
```

**発生時の対応**:

```bash
# 即座にロールバック
git restore content/blog/
git restore src/content/blog/
```

手動修正:
- 破損した記事を特定
- バックアップから復元
- 該当箇所のみ手動変換

---

### ビルドエラーの解決不能

**リスク内容**:
- Phase 3でビルドエラーが多発し解決できない
- 型エラーが大量に発生する
- ランタイムエラーが発生する

**影響**:
- 移行が完了できない
- デプロイができない

**予防策**:
- Phase 1でのプロトタイプ検証（ビルド成功を事前確認）
- 段階的実装（remarkプラグインを1つずつ追加）

**発生時の対応**:

```bash
# 詳細なエラーログを出力
pnpm run build 2>&1 | tee build-error.log

# 型エラーの詳細確認
pnpm run typecheck --verbose
```

段階的ロールバック:
- 問題のあるプラグインを無効化
- 最小構成でビルド成功を確認
- 徐々に機能を追加

---

## 重要リスク

### パフォーマンス劣化

**リスク内容**:
- ビルド時間が現状比150%を超える
- ページ表示速度が遅くなる
- LinkPreview OGP取得で遅延が発生

**影響**:
- 開発体験の低下
- ユーザー体験の低下

**予防策**:

```bash
# ベンチマーク計測
time pnpm run build
```

最適化手法:
- OGP取得はビルド時のみ（キャッシュ活用）
- remarkプラグインの並列処理
- 不要なプラグインの削除

**発生時の対応**:
- Next.js Analyticsで計測
- Lighthouse スコアで評価
- remarkプラグインの設定見直し
- キャッシュ戦略の導入

---

### Obsidianとの互換性問題

**リスク内容**:
- Obsidianで一部の記法がプレビューされない
- GFM Alertsが表示されない
- Wikilink（`[[]]`）との競合

**影響**:
- Obsidianでの執筆体験が低下
- プレビュー時に表示崩れが発生

**予防策**:
- Obsidianの最新版を使用（v1.5.0以降推奨）
- GFM Alertsサポートを確認

**発生時の対応**:
- Obsidian設定の調整（Strict Line Breaksを有効化）
- Obsidian非推奨の記法を避ける
- 標準Markdown優先で執筆

---

### SEO影響（インデックス低下）

**リスク内容**:
- 記事URLが変わることでSEO評価が下がる
- OGP画像が表示されなくなる
- 構造化データが失われる

**影響**:
- 検索流入の減少
- SNSシェア時の見栄えが悪化

**予防策**:
- URL維持（`/blog/{slug}`形式を変更しない）

**OGP確認**:
```bash
curl -I https://yoursite.com/blog/ogp/add-blog-to-portfolio
```

**発生時の対応**:
- Google Search Console対応
  - インデックス再送信
  - サイトマップ再送信
  - URLインスペクションツールで確認
- 移行後1週間はアクセス解析を監視
- 検索順位の変動を確認

---

## 注意リスク

### 既存記事の表示崩れ

**リスク内容**:
- 特殊なHTML構造が崩れる
- CSSスタイルが適用されない
- コードブロックの表示が崩れる

**対策**:
- Phase 4で全記事を目視確認
- 該当記事のみ手動修正
- CSSの調整

---

### 新規タグの追加漏れ

**リスク内容**:
- 新記事で新しいタグを使用したが`tag-slugs.ts`への追加を忘れる
- `pnpm run check:tags`が失敗する

**対策**:
- CIでcheck:tagsを実行（既存）
- 新規記事作成時のチェックリスト整備

---

## 関連ドキュメント

- [要件定義書](./blog-migration-requirements.md)
- [移行計画書](./blog-migration-plan.md)
- [受入基準書](./blog-migration-acceptance-criteria.md)
