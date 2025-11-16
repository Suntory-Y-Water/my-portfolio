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
  Claude: 'claude',
  ClaudeCode: 'claude-code',
  'GitHub Copilot': 'github-copilot',
  MCP: 'mcp',
  Cloudflare: 'cloudflare',
  'Cloudflare Workers': 'cloudflare-workers',
  Vercel: 'vercel',
  DevConatainers: 'devcontainers',
  Docker: 'docker',
  GitHub: 'github',
  'Visual Studio Code': 'vscode',
  Hono: 'hono',
  HonoX: 'honox',
  'Next.js': 'nextjs',
  'OpenNext.js': 'opennextjs',
  React: 'react',
  'Tailwind CSS': 'tailwind-css',
  'LINE Messaging API': 'line-messaging-api',
  Notion: 'notion',
  セキュリティ: 'security',
  ブログ: 'blog',
  ポートフォリオ: 'portfolio',
  絵文字: 'emoji',
  Obsidian: 'obsidian',
  Markdown: 'markdown',
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
