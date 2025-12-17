// @ts-check

import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { siteConfig } from './src/config/site.js';

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url,
  integrations: [
    react(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
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
      assetsInlineLimit: 4096,
      rollupOptions: {
        external: ['/pagefind/pagefind-ui.js'],
      },
    },
  },
});
