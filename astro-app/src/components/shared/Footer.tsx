import { Icons, SocialIcons } from '@/components/icons';
import { siteConfig } from '@/config/site';

export default function Footer() {
  const twitterUrl = siteConfig.links.twitter;
  const githubUrl = siteConfig.links.github;
  const copyrightName = siteConfig.copyRight;

  return (
    <footer className='mt-20 border-t border-border/40 bg-background/80 backdrop-blur-lg'>
      <div className='container mx-auto flex flex-col items-center justify-between gap-6 px-6 py-8 sm:flex-row'>
        {/* Copyright notice */}
        <p className='text-sm font-medium text-muted-foreground'>
          © {new Date().getFullYear()} {copyrightName}. All Rights Reserved.
        </p>

        {/* Social media links and RSS feed */}
        <div className='flex items-center gap-3'>
          {twitterUrl && (
            <SocialLink href={twitterUrl} label='Twitter'>
              <SocialIcons.twitter className='size-4' />
            </SocialLink>
          )}
          {githubUrl && (
            <SocialLink href={githubUrl} label='GitHub'>
              <SocialIcons.github className='size-4' />
            </SocialLink>
          )}
          <SocialLink href='/rss.xml' label='RSS'>
            <Icons.rss className='size-4' />
          </SocialLink>
        </div>
      </div>
    </footer>
  );
}

// アイコンボタンの共通コンポーネント
function SocialLink({
  href,
  children,
  label,
}: {
  href: string;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={label}
      className='flex size-9 items-center justify-center rounded-full border border-border/50 bg-secondary/30 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:shadow-lg hover:shadow-primary/20'
    >
      {children}
      <span className='sr-only'>{label}</span>
    </a>
  );
}
