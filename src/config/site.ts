import type { SiteConfig } from '@/types';

const url = process.env.NEXT_PUBLIC_APP_URL || 'https://suntory-n-water.com/';

export const siteConfig: SiteConfig = {
  name: 'sui-portfolio',
  description:
    'スイのポートフォリオです。簡単な自己紹介と今まで投稿してきた記事のリンクや、Web開発に関する学習記録をブログとしてまとめています。',
  url: url,
  ogImage: `${url}/opengraph-image.png`,
  links: {
    twitter: 'https://x.com/Suntory_N_Water',
    github: 'https://github.com/Suntory-Y-Water',
  },
  copyRight: 'Suntory-N-Water',
};
