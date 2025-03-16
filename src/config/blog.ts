import type { AuthorConfig } from '@/types';

export const author: AuthorConfig = {
  slug: 'cakegaly',
  name: 'cakegaly',
  image: 'https://github.com/cakegaly.png',
  twitter: 'cakegaly',
};

export const postsPerPage = 5;

// TODO: generateStaticParams()で使用されているtagsをどうにかしてmdxから取得できないか
export const tags: Record<string, { name: string }> = {
  eslint: { name: 'ESLint' },
  jamstack: { name: 'Jamstack' },
  nextjs: { name: 'Next.js' },
  react: { name: 'react' },
  typescript: { name: 'TypeScript' },
  wordpress: { name: 'WordPress' },
  vercel: { name: 'vercel' },
  python: { name: 'Python' },
};
