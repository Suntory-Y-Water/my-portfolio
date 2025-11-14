# MDX to Markdown 移行ステータス

最終更新: 2025-11-14

## 完了した項目 ✅

### 基本的なMarkdown構文
- [x] テキスト表示
- [x] 見出し（h2, h3, h4）
- [x] 太字、斜体
- [x] リスト（ul, ol）
- [x] テーブル
- [x] 画像
- [x] 水平線

### スタイリング
- [x] 元のMDXコンポーネント（`mdx-components.tsx`）のスタイルを適用
- [x] コードブロックのスタイル（角丸、パディング、横スクロール）
- [x] インラインコードのスタイル（角丸）
- [x] レスポンシブ対応（モバイルでの横スクロール）

### GFM Alerts (コールアウト)
- [x] `<Callout>` → `> [!NOTE]` 形式への変換
- [x] `info` → `NOTE`、`danger` → `CAUTION` へのマッピング
- [x] アイコンとテキストの横並びレイアウト
- [x] タイプ別の配色（NOTE, TIP, IMPORTANT, WARNING, CAUTION）

### URL表示
- [x] 長いURLの改行処理（`word-break`, `overflow-wrap`）
- [x] URLがはみ出さないように修正

### ビルドシステム
- [x] `content/blog/*.md` からの読み込み
- [x] unified/remark/rehype パイプライン構築
- [x] 型チェック、Lint通過
- [x] Frontmatterの日付形式保持

## 未完了の項目 ❌

### 1. コードブロックのコピーボタン

**現状:**
- 元のMDXでは `CodeBlock` コンポーネント（クライアントコンポーネント）でコピーボタンを実装
- 現在のMarkdownはSSRでHTMLにレンダリングされるため、ボタンが含まれない

**技術的課題:**
- `CodeBlock` は `'use client'` のクライアントコンポーネント
- `dangerouslySetInnerHTML` で挿入されたHTMLにはReactコンポーネントを埋め込めない

**解決策候補:**
1. クライアントサイドでコードブロックを検出してボタンを動的に追加
2. rehype プラグインでコピーボタンのHTMLを挿入し、hydration対応
3. Web Components を使用してコピー機能を実装

**参考:**
- 元の実装: `src/components/feature/content/code-block.tsx`

### 2. リンクカード

**現状:**
- `remark-link-card` プラグインを使用
- ビルド時にネットワークリクエストでOG情報を取得する仕様
- 開発環境でネットワークエラーが発生（`getaddrinfo EAI_AGAIN`）

**技術的課題:**
- Next.js 15 Server Components のビルド時にネットワークアクセスが不安定
- 外部URLへのリクエストがタイムアウトまたは失敗
- 本番環境でも動作保証がない

**参考プロジェクト:**
- https://azukiazusa.dev/blog/claude-code-sandbox-feature/ では動作している
- 実装方法の調査が必要

**解決策候補:**
1. **別のプラグインを試す**
   - `rehype-link-card` や他の代替プラグイン

2. **独自実装（API Route）**
   ```
   クライアント → API Route → OG情報取得 → キャッシュ → 返却
   ```
   - Next.js の API Route でサーバーサイド取得
   - Redis などでキャッシュ

3. **クライアントサイド取得**
   - ページ読み込み後に動的にOG情報を取得
   - Intersection Observer で遅延読み込み

4. **ビルド時の事前生成**
   - ビルド時にすべてのURLのOG情報を取得
   - 静的JSONファイルとして保存
   - ランタイムで読み込み

## その他のメモ

### レイアウト改善候補
- アイコンのレイアウトは動作しているが、さらなる改善の余地あり
- モバイル表示の最適化

### パフォーマンス
- unified パイプラインの処理速度は良好
- remarkプラグインのビルド時間への影響は最小限

### メンテナンス性
- `src/styles/mdx.css` に全スタイルが集約
- `scripts/convert-mdx-to-md.ts` で一括変換可能
- 既存のMDXファイルは `src/content/blog.backup/` にバックアップ済み

## 次のアクション

1. **リンクカード実装の調査**
   - 参考プロジェクト（azukiazusa.dev）のソースコード確認
   - 代替手段の評価

2. **コピーボタンの実装**
   - rehype プラグインでの実装を検討
   - またはクライアントサイドでの動的追加

3. **本番環境での動作確認**
   - Vercel/Cloudflare などの本番環境でのビルド確認
   - リンクカードが本番で動作するか検証
