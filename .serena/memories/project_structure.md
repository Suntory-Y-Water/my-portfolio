# プロジェクト構造

## ルートディレクトリ
```
my-portfolio/
├── .github/          # GitHub Actions設定
├── .vscode/          # VSCode設定  
├── public/           # 静的ファイル
├── src/              # ソースコード
├── package.json      # 依存関係と scripts
├── tsconfig.json     # TypeScript設定
├── next.config.mjs   # Next.js設定
├── eslint.config.mjs # ESLint設定
├── prettier.config.mjs # Prettier設定
├── tailwind.config.ts # Tailwind CSS設定
├── postcss.config.js # PostCSS設定
└── CLAUDE.md         # AI運用規則
```

## src/ ディレクトリ構造
```
src/
├── app/              # Next.js App Router
│   ├── page.tsx      # ホームページ
│   ├── layout.tsx    # ルートレイアウト
│   ├── blog/         # ブログ関連ページ
│   │   ├── page.tsx  # ブログ一覧
│   │   ├── [slug]/   # 個別記事ページ
│   │   ├── page/[page]/ # ページネーション
│   │   ├── ogp/[slug]/ # OGP画像生成
│   │   └── md/[slug]/ # Markdown表示
│   ├── posts/        # 投稿ページ
│   ├── tags/         # タグ関連ページ
│   ├── rss.xml/      # RSS配信
│   ├── llms.txt/     # LLMs用情報
│   ├── robots.ts     # robots.txt
│   ├── sitemap.ts    # サイトマップ
│   ├── not-found.tsx # 404ページ
│   └── error.tsx     # エラーページ
├── components/       # Reactコンポーネント
│   ├── ui/           # 基本UIコンポーネント
│   ├── feature/      # 機能固有コンポーネント
│   ├── shared/       # 共有コンポーネント
│   └── icons/        # アイコンコンポーネント
├── contents/         # コンテンツファイル
│   └── blog/         # ブログMDXファイル
├── lib/              # ユーティリティ・ライブラリ
│   ├── utils.ts      # 汎用ユーティリティ
│   ├── mdx.ts        # MDX処理
│   ├── pagination.ts # ページネーション
│   ├── toc.ts        # 目次生成
│   ├── client.ts     # クライアント設定
│   └── image-loader.ts # 画像ローダー
├── types/            # TypeScript型定義
├── config/           # 設定ファイル
├── actions/          # Server Actions
├── assets/           # アセットファイル
└── styles/           # スタイルファイル
```

## 設定ファイルの役割

### TypeScript設定
- `tsconfig.json`: 基本TypeScript設定
- `tsconfig.build.json`: ビルド用設定

### Next.js設定
- カスタム画像ローダー設定
- セキュリティヘッダー設定
- MDXサポート
- バンドル分析機能

### パッケージ管理
- pnpmを使用
- 依存関係は最新安定版を維持