import type { SiteConfig } from '@/types';

/**
 * TODO: get site_url via T3 env
 *
 * @see https://env.t3.gg/
 */
export const siteConfig: SiteConfig = {
  name: 'sui-portfolio',
  description:
    'スイのポートフォリオです。簡単な自己紹介と今まで投稿してきた記事のリンクをまとめています。',
  url: 'https://suntory-n-water.com/',
  ogImage: 'https://suntory-n-water.com/opengraph-image.png',
  links: {
    twitter: 'https://x.com/Suntory_N_Water',
    github: 'https://github.com/Suntory-Y-Water',
  },
  copyRight: 'Suntory-N-Water',
};
