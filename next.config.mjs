/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  typescript: {
    tsconfigPath: 'tsconfig.build.json',
  },
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/microsoft/fluentui-emoji/main/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-37c337e4f6b74be784982bc3041040b4.r2.dev',
        pathname: '/**',
      },
    ],
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],

  async redirects() {
    return [
      // ブログの1ページ目はブログトップと同じ役割なのでリダイレクト
      {
        source: '/blog/page/1',
        destination: '/blog',
        permanent: true,
      },
    ];
  },

  // セキュリティヘッダの追加
  async headers() {
    return [
      {
        // すべてのパスに適用
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },

  // .mdサフィックスでMarkdown配信
  async rewrites() {
    return [
      {
        source: '/blog/:slug.md',
        destination: '/blog/md/:slug',
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
