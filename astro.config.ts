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
  cacheDir: './node_modules/.astro',
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
    concurrency: 4,
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
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'radix-ui': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slot',
            ],
          },
        },
      },
    },
  },
});
