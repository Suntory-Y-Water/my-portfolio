# プロジェクト構造

## ディレクトリ構成

```
sui-blog/
├── .astro/              # Astro自動生成ファイル
├── .claude/             # Claude Code設定
├── .git/                # Gitリポジトリ
├── .github/             # GitHub Actions等
├── .husky/              # Git hooks
├── .kiri/               # Kiri MCP設定
├── .serena/             # Serena MCP設定
├── .vscode/             # VSCode設定
├── biome-plugins/       # カスタムBiomeプラグイン
├── contents/            # ブログコンテンツ (Markdown)
│   ├── blog/            # ブログ記事 (.md)
│   ├── slides/          # スライド
│   ├── templates/       # テンプレート
│   └── .textlintrc.json # textlint設定
├── dist/                # ビルド出力 (gitignore)
├── docs/                # ドキュメント
├── node_modules/        # 依存パッケージ (gitignore)
├── public/              # 静的ファイル
│   └── icons/           # アイコン (SVG等)
├── scripts/             # ユーティリティスクリプト
│   ├── check-tags.ts              # タグ整合性チェック
│   ├── check-svg-security.ts      # SVGセキュリティチェック
│   ├── create-blog-template.ts    # ブログテンプレート作成
│   ├── update-blog-icon.ts        # ブログアイコン更新
│   ├── fix-url-blank-lines.ts     # URL空行自動修正
│   └── detect-url-without-blank-lines.ts # URL空行検出
└── src/                 # ソースコード
    ├── components/      # Reactコンポーネント
    ├── config/          # 設定ファイル
    │   ├── site.ts             # サイト設定
    │   └── tag-slugs.ts        # タグ定義
    ├── constants/       # 定数定義
    ├── layouts/         # Astroレイアウト
    ├── lib/             # ユーティリティ関数
    ├── pages/           # Astroページ (ルーティング)
    ├── styles/          # グローバルスタイル
    ├── types/           # TypeScript型定義
    └── content.config.ts # Astro Content Collections設定
```

## 主要設定ファイル

- `astro.config.ts`: Astro設定
- `biome.jsonc`: Biome設定 (Lint/Format)
- `tsconfig.json`: TypeScript設定
- `package.json`: 依存関係・スクリプト定義
- `components.json`: Radix UI設定
- `vercel.json`: Vercelデプロイ設定
- `lighthouserc.json`: Lighthouse CI設定
- `.mcp.json`: MCP Server設定
- `CLAUDE.md`: Claude Code AI向けリファレンス

## ビルド出力

- `dist/`: 静的生成されたHTMLファイル
- `dist/pagefind/`: Pagefind検索インデックス (postbuildで生成)

## エントリーポイント

- **開発**: `bun run dev` → Astro開発サーバー
- **本番ビルド**: `bun run build` → `dist/` に静的生成
- **プレビュー**: `bun run start` → ビルド後プレビューサーバー

## 記事管理

- 記事ファイル: `contents/blog/*.md`
- フロントマター形式:
  ```yaml
  ---
  title: "記事タイトル"
  description: "記事説明"
  published: 2024-01-01
  tags: ["tag-slug"]
  ---
  ```
- タグ定義: `src/config/tag-slugs.ts` の `TAG_SLUG_MAP`

## スタイリング

- Tailwind CSS 4.x: `@tailwindcss/vite` でVite統合
- グローバルスタイル: `src/styles/`
- Radix UI: コンポーネントライブラリ
