import Link from 'next/link';
import { SocialIcons } from '@/components/icons';
import { siteConfig } from '@/config/site';

export default function Footer() {
  const twitterUrl = siteConfig.links.twitter;
  const githubUrl = siteConfig.links.github;
  const copyrightName = siteConfig.copyRight;

  return (
    <footer className='mt-16 border-t border-border/40 bg-muted/50'>
      {/* Use container for consistent width */}
      <div className='container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row'>
        {/* Copyright notice */}
        <p className='text-sm text-muted-foreground'>
          © {new Date().getFullYear()} {copyrightName}. All Rights Reserved.
        </p>

        {/* Social media links */}
        <div className='flex items-center gap-4'>
          {twitterUrl && ( // Render only if URL exists
            <Link
              href={twitterUrl}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Twitter profile'
              className='text-muted-foreground transition-colors hover:text-foreground'
            >
              <SocialIcons.twitter className='size-5' />
              <span className='sr-only'>Twitter</span>
            </Link>
          )}
          {githubUrl && ( // Render only if URL exists
            <Link
              href={githubUrl}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='GitHub profile'
              className='text-muted-foreground transition-colors hover:text-foreground'
            >
              <SocialIcons.github className='size-5' />
              <span className='sr-only'>GitHub</span>
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
