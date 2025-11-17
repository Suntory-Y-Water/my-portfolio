import { REPOSITORY, SITE, SOCIAL } from '@/constants';
import type { SiteConfig } from '@/types';

export const siteConfig: SiteConfig = {
  name: SITE.NAME,
  description: SITE.DESCRIPTION,
  blogDescription: SITE.BLOG_DESCRIPTION,
  url: SITE.URL,
  ogImage: SITE.OG_IMAGE,
  links: {
    twitter: SOCIAL.TWITTER,
    github: SOCIAL.GITHUB,
  },
  repository: {
    branch: REPOSITORY.BRANCH,
  },
  copyRight: SITE.COPYRIGHT,
};
