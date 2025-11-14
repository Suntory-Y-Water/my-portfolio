# Phase 1: プロトタイプ検証レポート

## 検証日
2025-11-14

## サンプル記事
`response-header-web-check-list.mdx` → `response-header-web-check-list.md`

## remarkプラグイン互換性調査結果

### 1. remark-link-card (v1.3.1)
- **インストール**: 成功
- **動作確認**: ネットワークエラー（OGP取得失敗）
- **原因**: テスト環境でのネットワーク制約の可能性
- **評価**: ビルド時に外部URLへのアクセスが必要。本番環境で再検証が必要

### 2. remark-github-blockquote-alert (v2.0.0)
- **インストール**: 成功
- **動作確認**: 成功
- **評価**: `> [!NOTE]` 構文が正しくHTMLに変換される

### 3. unified エコシステム
- unified (v11.0.5)
- remark-parse (v11.0.0)
- remark-rehype (v11.1.2)
- rehype-stringify (v10.0.1)
- remark-gfm (v4.0.1)

すべて正常にインストールされ、基本的な動作を確認。

## 手動変換結果

### 変換内容
- `<LinkPreview url='...' />` → `[https://...](https://...)`
- `<Callout type='info' title=''>...</Callout>` → `> [!NOTE]\n> ...`

### 課題
- フロントマターの処理が必要（gray-matterで分離）
- remark-link-cardのネットワークアクセス問題

## 判定結果

### ✓ 技術的実現可能性: 確認できた
- remarkプラグインは基本的に動作する
- GFM Alertsは問題なく変換される
- unifiedエコシステムとの互換性あり

### ⚠️ remark-link-cardの代替案検討が必要
以下の選択肢を検討:

1. **本番環境で再検証**: ネットワークアクセスが可能な環境であれば動作する可能性
2. **代替プラグイン**: `remark-embed`、`remark-oembed`等
3. **カスタムプラグイン開発**: 既存のLinkPreviewロジックを流用

## Obsidian検証
未実施（Phase 2以降で実施）

## 次のステップ

**Phase 2に進む**: 変換ツール開発を開始する

~~ただし、remark-link-cardについては以下の対応を並行して実施:~~
~~- 本番ビルド環境でのテスト~~
~~- 代替プラグインの調査~~
~~- 必要に応じてカスタムプラグイン開発を検討~~

---

## 【追記: 2025-11-14】remark-link-card問題の解決

### 問題
- `remark-link-card` (npm版) はネットワークエラー時にURLが消失する問題
- 参考プロジェクト（azukiazusa.dev）は独自の`remark-link-card`（v0.0.0, monorepo内）を使用

### 解決策
カスタム`rehype-link-card`プラグインを実装（`src/lib/rehype-link-card.ts`）

**実装内容:**
- 既存の`getOGData` Server Action（`@/actions/fetch-og-metadata`）を使用
- SSG（Static Site Generation）でOG情報を取得
- エラー時はURLを消さず、フォールバック表示
- `allowDangerousHtml`で静的HTML生成

**結果:**
- リンクカード機能が安定して動作
- ビルド時にOG情報を取得・キャッシュ
- エラーハンドリングが適切に動作
