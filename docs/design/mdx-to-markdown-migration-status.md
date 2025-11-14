# MDX to Markdown 移行ステータス

最終更新: 2025-11-14 (Session: claude/create-execution-plan-01NdG7dnUQbUY32R4iTwK7Au)

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

### リンクカード（基本機能）
- [x] カスタム `rehype-link-card` プラグイン実装
- [x] 既存の `getOGData` Server Actionを使用
- [x] SSG（Static Site Generation）でOG情報取得
- [x] エラーハンドリング（URLが消えない仕組み）
- [x] ファビコン、タイトル、説明文の表示
- [x] `allowDangerousHtml` でHTMLインジェクション対応

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

### 2. リンクカードのレイアウト調整

**現状:**
- カスタム `rehype-link-card` プラグインで基本機能は実装済み（`src/lib/rehype-link-card.ts`）
- OG情報の取得は動作しているが、レイアウトが元のLinkPreviewコンポーネントと完全に一致していない
- アイコン周りの配置、余白、スタイルが微妙にずれている

**技術的課題:**
- rehypeプラグインで生成する静的HTMLと、元のReactコンポーネント（`link-preview.tsx`）のレイアウトを完全一致させる
- TailwindクラスをHTML文字列として正確に再現する必要がある
- ネストされたdiv構造、flex、gap、paddingの完全一致

**実装内容:**
- `src/lib/rehype-link-card.ts` でカスタムrehypeプラグイン実装
- `getOGData` Server Action（`@/actions/fetch-og-metadata`）を使用
- エラー時はURLを消さず、フォールバック表示
- ファビコン、タイトル、説明文、OGイメージを表示

**参考:**
- 元の実装: `src/components/feature/content/link-preview.tsx`（lines 56-90）
- azukiazusa.devでは独自の `remark-link-card` パッケージ（v0.0.0, monorepo内）を使用
- npmの `remark-link-card`（gladevise製）はエラー時にURL消失の問題があり不採用

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

1. **リンクカードのレイアウト完全一致**
   - 元の `link-preview.tsx` と生成HTMLの完全一致を目指す
   - アイコン、ファビコン、余白のピクセルパーフェクトな調整
   - デプロイして実際のレンダリングを確認

2. **コピーボタンの実装**
   - rehype プラグインでの実装を検討
   - またはクライアントサイドでの動的追加
   - Web Components の検討

3. **本番環境での動作確認**
   - Vercel でのビルド確認
   - リンクカードのOG取得が本番で正常動作するか検証
   - パフォーマンス計測
