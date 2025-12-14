// @ts-check

import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkAlert from 'remark-github-blockquote-alert';
import { siteConfig } from './src/config/site.js';
import { rehypeCodeCopyButton } from './src/lib/rehype-code-copy-button.js';
// カスタムrehypeプラグイン
// import { rehypeLinkCard } from './src/lib/rehype-link-card.js';
import { rehypeMermaidCodeToDiv } from './src/lib/rehype-mermaid-code.js';

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['@resvg/resvg-js'],
    },
    ssr: {
      noExternal: ['satori'],
      external: ['@resvg/resvg-js'],
    },
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind-ui.js'],
      },
    },
  },
  // TODO: これ消しても src/components/feature/content/custom-markdown.tsx で定義しているから今動いちゃうぞ
  markdown: {
    // シンタックスハイライト設定（rehypePrettyCodeを使用するため無効化）
    syntaxHighlight: false,
    // remarkプラグイン
    remarkPlugins: [remarkGfm, remarkBreaks, remarkAlert],
    // rehypeプラグイン
    rehypePlugins: [
      rehypeSlug,
      // rehypeLinkCard,
      rehypeMermaidCodeToDiv,
      [
        rehypePrettyCode,
        {
          theme: 'slack-dark',
          keepBackground: true,
          defaultLang: 'plaintext',
          // ファイル名をtitle属性に変換
          filterMetaString: (meta: string) => {
            if (!meta) {
              return meta;
            }
            // すでにtitle属性がある場合はそのまま返す
            if (meta.includes('title=')) {
              return meta;
            }
            // ファイル名っぽい文字列(拡張子を含む)を検出
            const match = meta.match(/^([^\s{]+\.\w+)(.*)$/);
            if (match) {
              const filename = match[1];
              const rest = match[2] || '';
              return `title="${filename}"${rest}`;
            }
            return meta;
          },
        },
      ],
      rehypeCodeCopyButton,
    ],
  },
});
