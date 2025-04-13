import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { SocialIcons } from '@/components/icons/social-icons';
import { Button } from '@/components/ui/button';

interface GitHubEditButtonProps {
  filePath?: string;
}

const GITHUB_EDIT_URL_BASE = `${siteConfig.links.github}/my-portfolio/blob/${siteConfig.repository?.branch ?? 'main'}/`;

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
