import Link from 'next/link';
import { SocialIcons } from '@/components/icons/social-icons';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

type GitHubEditButtonProps = {
  filePath?: string;
};

const GITHUB_EDIT_URL_BASE = `${siteConfig.links.github}/my-portfolio/blob/${siteConfig.repository?.branch ?? 'main'}/`;

/**
 * GitHubで記事の修正を提案するボタンコンポーネント
 *
 * このコンポーネントはブログ記事やドキュメントページに表示され、
 * クリックするとGitHub上の該当ファイルを開いて修正提案を行えるようにします。
 * filePathが指定されていない場合や、GitHubのURLが設定されていない場合は何も表示されません。
 *
 * @param filePath - GitHubリポジトリ内のファイルパス（任意）。例: 'content/blog/2025-01-15-typescript.md'。指定されていない場合はボタンを表示しません
 * @returns GitHubで編集ボタンコンポーネント。filePathがない場合はnullを返します
 *
 * @example
 * ```tsx
 * import { GitHubEditButton } from '@/components/feature/content/github-edit-button';
 *
 * export default function BlogPost() {
 *   const filePath = 'content/blog/2025-01-15-typescript.md';
 *
 *   return (
 *     <article>
 *       <h1>TypeScriptの型定義について</h1>
 *       <p>記事の内容...</p>
 *       <GitHubEditButton filePath={filePath} />
 *     </article>
 *   );
 * }
 * // 出力: GitHubのアイコンと「GitHubで修正を提案する」というテキストのボタンが表示されます
 * // クリックすると https://github.com/username/my-portfolio/blob/main/content/blog/2025-01-15-typescript.md が開きます
 * ```
 */
export function GitHubEditButton({ filePath }: GitHubEditButtonProps) {
  if (!filePath || !siteConfig.links.github || !siteConfig.repository?.branch) {
    return null;
  }

  const editUrl = `${GITHUB_EDIT_URL_BASE}${filePath}`;

  return (
    <Button variant='outline' size='sm' asChild>
      <Link href={editUrl} target='_blank' rel='noopener noreferrer'>
        <SocialIcons.github className='mr-2 size-4' />
        GitHubで修正を提案する
      </Link>
    </Button>
  );
}
