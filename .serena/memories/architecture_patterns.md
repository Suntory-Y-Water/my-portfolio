# アーキテクチャとデザインパターン

## アーキテクチャ概要

### 静的サイト生成 (SSG)
- **フレームワーク**: Astro (SSG特化)
- **戦略**: ビルド時に全ページを静的HTML生成
- **メリット**: 高速配信、SEO最適化、ホスティングコスト削減

### Markdown中心のコンテンツ管理
- 記事は `contents/blog/*.md` に配置
- フロントマター + Markdown

## コンポーネント戦略

### Astro Islands (部分的ハイドレーション)
- 基本はHTML/CSS (静的)
- インタラクティブ部分のみReactコンポーネント
- クライアントサイドJS最小化

### Reactコンポーネント
- `src/components/` に配置
- Radix UIベースのアクセシブルUI
- client:loadディレクティブで選択的ハイドレーション

## Markdownパイプライン

### 処理フロー
```
Markdown (.md)
  ↓
remark (Markdown AST)
  ↓
rehype (HTML AST)
  ↓
カスタムプラグイン
  ├─ rehype-pretty-code (シンタックスハイライト)
  ├─ rehype-slug (見出しID)
  ├─ rehype-mermaid (図表)
  ├─ remark-breaks (改行処理)
  └─ remark-github-blockquote-alert (アラート)
  ↓
HTML生成
```

### カスタムプラグイン
- コピーボタン自動挿入
- リンクカード生成
- Mermaid図レンダリング

## OGP画像生成

### 技術スタック
- **Satori**: HTML/CSS → SVG変換
- **@resvg/resvg-js**: SVG → PNG変換

### 生成戦略
- ビルド時に記事ごとに静的生成
- `dist/` に画像出力
- キャッシュ最適化 (再ビルド時の効率化)

## 検索機能

### Pagefind (静的全文検索)
- **生成タイミング**: `postbuild` スクリプト
- **インデックス**: `dist/pagefind/` に生成
- **動作**: クライアントサイドで検索実行
- **メリット**: サーバー不要、高速、オフライン対応

## スタイリングアーキテクチャ

### Tailwind CSS 4.x
- **統合**: `@tailwindcss/vite` プラグイン
- **設定**: `astro.config.ts` のVite設定
- **戦略**: ユーティリティファーストCSS

### コンポーネント設計
- **Radix UI**: 低レベルUIプリミティブ
- **class-variance-authority**: バリアントベーススタイル
- **tailwind-merge**: クラス名競合解決

## 型安全性

### TypeScript設定
- `verbatimModuleSyntax`: import/exportの明示化
- パスエイリアス: `@/*` → `src/*`
- Astro型定義: `.astro/types.d.ts` 自動生成

### Content Collections
- `src/content.config.ts`: スキーマ定義
- フロントマターの型安全性
- Astroネイティブの型推論

## コード品質保証

### Biome (統合ツール)
- **Lint**: ESLint代替
- **Format**: Prettier代替 (JS/TS/JSON)
- **CI**: 変更ファイル検出

### カスタムルール
- 関数引数2個以上 → オブジェクト形式強制
- `any` 型禁止
- `interface` 禁止、`type` 使用

### Git Hooks (Husky)
- pre-commit: SVGセキュリティ、タグチェック、textlint
- 自動修正 + 再ステージング

## パフォーマンス最適化

### ビルド時最適化
- Vite: `assetsInlineLimit: 4096` (小画像インライン化)
- Partytown: サードパーティスクリプトWeb Worker化
- 静的アセット最適化

### 配信最適化
- 静的HTML配信
- CDNフレンドリー
- ゼロJavaScript (インタラクティブ部分以外)

## 開発ワークフロー

### ローカル開発
1. `bun run dev`: 開発サーバー起動
2. ホットリロード (Astro HMR)
3. 型チェック: VSCode + `astro check`

### デプロイフロー
1. `bun run build`: 静的生成
2. `pagefind`: 検索インデックス生成
3. `dist/` をVercelにデプロイ

### 品質チェックフロー
1. コード修正
2. `bun run format`: フォーマット
3. `bun run type-check:ai`: 型チェック
4. `bun run lint:ai`: Lint
5. コミット (pre-commitフック自動実行)
