export const postsPerPage = 5;

// TODO: generateStaticParams()で使用されているtagsをどうにかしてmdxから取得できないか
// @see https://github.com/cakegaly/next-minimal-blog/blob/main/src/config/blog.ts
const tags: Record<string, { name: string }> = {
  eslint: { name: 'ESLint' },
  jamstack: { name: 'Jamstack' },
  nextjs: { name: 'Next.js' },
  react: { name: 'react' },
  typescript: { name: 'TypeScript' },
  wordpress: { name: 'WordPress' },
  vercel: { name: 'vercel' },
  python: { name: 'Python' },
};
