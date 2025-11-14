# ブログ記事管理システム移行 受入基準

## ファイル配置・形式

- 全13記事が`content/blog/`配下に配置されている
- `src/content/blog/`配下にMDXファイルが残っていない
- 全記事が`.md`拡張子になっている

**検証方法**:
```bash
ls content/blog/*.md | wc -l  # 期待値: 13
ls src/content/blog/*.mdx 2>/dev/null | wc -l  # 期待値: 0
```

---

## コンテンツ変換

- MDXコンポーネント構文が残っていない
  - `<LinkPreview>`構文: 0箇所
  - `<Callout>`構文: 0箇所
  - `<Image>`構文: 0箇所
- フロントマターが正しく保持されている（`title`, `date`, `description`, `tags`）

**検証方法**:
```bash
# MDXコンポーネント構文の検索（ヒットしないことを確認）
grep -r "<LinkPreview" content/blog/*.md
grep -r "<Callout" content/blog/*.md
grep -r "<Image " content/blog/*.md

# フロントマター確認（サンプル）
head -n 10 content/blog/add-blog-to-portfolio.md
```

---

## ビルド・デプロイ

- `pnpm run build`がエラーなく完了する
- `pnpm run typecheck`がパスする
- `pnpm run lint`がパスする
- `pnpm run check:tags`がパスする
- 本番環境へのデプロイが成功する

**検証方法**:
```bash
pnpm run typecheck && pnpm run lint && pnpm run check:tags && pnpm run build
echo $?  # 期待値: 0
```

---

## 機能動作

### 記事表示
- 全13記事が個別ページで正しく表示される
- タイトル、日付、タグが表示される
- 本文が正しくレンダリングされる

### LinkPreview機能
- [x] 外部リンクがカード形式で表示される（カスタムrehype-link-card実装）
- [x] OGP情報（タイトル、説明、画像）が取得・表示される
- [x] リンクカードのクリックで外部サイトに遷移する
- [~] レイアウトが元のLinkPreviewコンポーネントと完全一致（微調整中）
- [x] エラー時にURLが消えずフォールバック表示される

### Callout機能
- GFM Alerts記法が正しく表示される
- NOTE/WARNING/TIP等のタイプに応じたスタイルが適用される
- アイコンと背景色が表示される

### タグ機能
- 記事詳細ページでタグが表示される
- タグリンクをクリックすると該当タグページに遷移する
- タグページで記事一覧が表示される
- タグURLがslug形式になっている（例: `/tags/vscode`）

### 目次機能
- 記事に目次が表示される
- 目次リンクをクリックすると該当見出しにスクロールする
- アンカーリンクが正しく機能する

**検証方法**:
```bash
pnpm run dev
# ブラウザで全13記事にアクセスして確認
```

---

## Obsidian対応

- Obsidianで`content/`をボルトとして開ける
- ボルト内で全13記事がリスト表示される
- Markdown記法がObsidianで正しくプレビューされる
- GFM Alertsが表示される（または適切にフォールバック）
- リンクが機能する
- Obsidianで記事を編集・保存できる

**検証方法**:
1. Obsidianを起動
2. 「Open folder as vault」で`content/`を選択
3. ランダムに5記事を開いてプレビュー確認
4. 新規記事を作成して編集・保存テスト

---

## SEO・パフォーマンス

- 既存記事のURLが変更されていない（`/blog/{slug}`形式）
- OGP画像が生成される（`/blog/ogp/{slug}`でアクセス可能）
- 構造化データ（JSON-LD）が出力されている
- Lighthouse スコアが90以上（Performance）

**検証方法**:
```bash
# URL確認
curl -I http://localhost:3000/blog/add-blog-to-portfolio
# 期待値: 200 OK（302リダイレクトではない）

# OGP画像確認
curl -I http://localhost:3000/blog/ogp/add-blog-to-portfolio
# 期待値: 200 OK
```

ページソースを表示して`<script type="application/ld+json">`を確認

Chrome DevToolsのLighthouseで計測（3回計測して平均値を算出）

---

## 関連ドキュメント

- [要件定義書](./blog-migration-requirements.md)
- [移行計画書](./blog-migration-plan.md)
- [リスク管理表](./blog-migration-risks.md)
