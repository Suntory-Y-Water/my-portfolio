/**
 * タグ名→slug、slug→タグ名のマッピングテーブル
 *
 * ## ルール
 * - 画面表示: 日本語タグ（例: "アクセシビリティ"）
 * - URL: 英語slug（例: "accessibility"）
 * - slug: 小文字、ハイフン区切り、英数字のみ
 *
 * ## 新しいタグを追加する場合
 * 1. このファイルにマッピングを追加
 * 2. CI/CDで自動的にバリデーションされる
 */

export const TAG_SLUG_MAP: Record<string, string> = {
  API: 'api',
  AppRouter: 'app-router',
  ChromeExtension: 'chrome-extension',
  CI: 'ci',
  clasp: 'clasp',
  Claude: 'claude',
  ClaudeCode: 'claude-code',
  Cloudflare: 'cloudflare',
  CloudflareWorkers: 'cloudflare-workers',
  Contest2025TS: 'contest2025ts',
  CSS: 'css',
  Decode: 'decode',
  Dependabot: 'dependabot',
  DevContainer: 'devcontainer',
  DevConatainers: 'devcontainers',
  DI: 'di',
  Docker: 'docker',
  E2E: 'e2e',
  GAS: 'gas',
  GitHub: 'github',
  'GitHub Copilot': 'github-copilot',
  GitHubActions: 'github-actions',
  GoogleAppScript: 'google-app-script',
  Hono: 'hono',
  HonoX: 'honox',
  HTML: 'html',
  InversifyJS: 'inversify-js',
  Kubernetes: 'kubernetes',
  LineMessagingAPI: 'line-messaging-api',
  Markdown: 'markdown',
  Marp: 'marp',
  MCP: 'mcp',
  'Next.js': 'nextjs',
  Notion: 'notion',
  NotionAPI: 'notion-api',
  Obsidian: 'obsidian',
  OGP: 'ogp',
  'OpenNext.js': 'opennextjs',
  Playwright: 'playwright',
  PostgreSQL: 'postgresql',
  PowerPoint: 'powerpoint',
  Python: 'python',
  React: 'react',
  Recharts: 'recharts',
  Serena: 'serena',
  'shadcn/ui': 'shadcn-ui',
  TailwindCSS: 'tailwind-css',
  TypeScript: 'typescript',
  Vercel: 'vercel',
  'Visual Studio Code': 'vscode',
  Vite: 'vite',
  Vitest: 'vitest',
  WebAPI: 'web-api',
  Wikipedia: 'wikipedia',
  Word2Vec: 'word2vec',
  ZennFes2025AI: 'zennfes2025ai',
  セキュリティ: 'security',
  ブログ: 'blog',
  ポートフォリオ: 'portfolio',
  絵文字: 'emoji',
  オブジェクト指向プログラミング: 'object-oriented-programming',
  クリーンアーキテクチャ: 'clean-architecture',
  'SOLID原則': 'solid-principles',
  テスト: 'test',
  データベース: 'database',
  ヘルスケア: 'healthcare',
  個人開発: 'personal-development',
  睡眠: 'sleep',
  アニメ: 'anime',
} as const;

/**
 * タグ名からslugを取得
 * マッピングテーブルに存在しない場合は自動slug化にフォールバック
 */
export function getTagSlug(tagName: string): string {
  const slug = TAG_SLUG_MAP[tagName];
  if (slug) {
    return slug;
  }

  // フォールバック: 自動slug化
  return slugifyTag(tagName);
}

/**
 * slugからタグ名を取得
 */
export function getTagNameFromSlug(slug: string): string | undefined {
  const entry = Object.entries(TAG_SLUG_MAP).find(([_, s]) => s === slug);
  return entry?.[0];
}

/**
 * タグ名を自動的にslug化する関数（フォールバック用）
 *
 * 変換例:
 * - "Visual Studio Code" → "visual-studio-code"
 * - "TypeScript" → "typescript"
 * - "Next.js" → "nextjs"
 *
 * 注意: 日本語はそのまま残るため、マッピングテーブルでの明示的な定義を推奨
 */
function slugifyTag(tag: string): string {
  return tag
    .toLowerCase() // 小文字化
    .normalize('NFKD') // Unicode正規化
    .replace(/[\u0300-\u036f]/g, '') // アクセント記号削除
    .replace(/[^a-z0-9\s-]/g, '') // 英数字とスペース、ハイフン以外を削除
    .trim() // 前後の空白削除
    .replace(/\s+/g, '-') // スペースをハイフンに
    .replace(/-+/g, '-'); // 連続ハイフンを1つに
}

/**
 * マッピングテーブルに登録されている全てのタグ名を取得
 */
export function getAllMappedTagNames(): string[] {
  return Object.keys(TAG_SLUG_MAP);
}

/**
 * マッピングテーブルに登録されている全てのslugを取得
 */
export function getAllMappedSlugs(): string[] {
  return Object.values(TAG_SLUG_MAP);
}
