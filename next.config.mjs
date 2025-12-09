/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  analyzerMode: process.env.ANALYZE_MODE || 'static', // 'json' を指定すると JSON 出力
  reportFilename: process.env.BUNDLE_REPORT || './.next/analyze/client.html',
  generateStatsFile: process.env.ANALYZE_STATS === 'true',
  statsFilename: process.env.BUNDLE_STATS || './.next/analyze/stats.json',
  openAnalyzer: false,
  statsOptions: { source: false }, // 必要に応じて
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
      {
        protocol: 'https',
        hostname: 'pub-151065dba8464e6982571edb9ce95445.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
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
      // 旧タグURL → 新タグURLへの301リダイレクト
      {
        source: '/tags/Claude',
        destination: '/tags/claude',
        permanent: true,
      },
      {
        source: '/tags/ClaudeCode',
        destination: '/tags/claude-code',
        permanent: true,
      },
      {
        source: '/tags/Cloudflare',
        destination: '/tags/cloudflare',
        permanent: true,
      },
      {
        source: '/tags/Cloudflare%20Workers',
        destination: '/tags/cloudflare-workers',
        permanent: true,
      },
      {
        source: '/tags/DevConatainers',
        destination: '/tags/devcontainer',
        permanent: true,
      },
      {
        source: '/tags/Docker',
        destination: '/tags/docker',
        permanent: true,
      },
      {
        source: '/tags/GitHub',
        destination: '/tags/github',
        permanent: true,
      },
      {
        source: '/tags/GitHub%20Copilot',
        destination: '/tags/github-copilot',
        permanent: true,
      },
      {
        source: '/tags/Hono',
        destination: '/tags/hono',
        permanent: true,
      },
      {
        source: '/tags/HonoX',
        destination: '/tags/honox',
        permanent: true,
      },
      {
        source: '/tags/LINE%20Messaging%20API',
        destination: '/tags/line-messaging-api',
        permanent: true,
      },
      {
        source: '/tags/MCP',
        destination: '/tags/mcp',
        permanent: true,
      },
      {
        source: '/tags/Next.js',
        destination: '/tags/nextjs',
        permanent: true,
      },
      {
        source: '/tags/Notion',
        destination: '/tags/notion',
        permanent: true,
      },
      {
        source: '/tags/OpenNext.js',
        destination: '/tags/opennextjs',
        permanent: true,
      },
      {
        source: '/tags/React',
        destination: '/tags/react',
        permanent: true,
      },
      {
        source: '/tags/Tailwind%20CSS',
        destination: '/tags/tailwind-css',
        permanent: true,
      },
      {
        source: '/tags/Vercel',
        destination: '/tags/vercel',
        permanent: true,
      },
      {
        source: '/tags/Visual%20Studio%20Code',
        destination: '/tags/vscode',
        permanent: true,
      },
      {
        source: '/tags/%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3',
        destination: '/tags/security',
        permanent: true,
      },
      {
        source: '/tags/%E3%83%96%E3%83%AD%E3%82%B0',
        destination: '/tags/blog',
        permanent: true,
      },
      {
        source: '/tags/%E3%83%9D%E3%83%BC%E3%83%88%E3%83%95%E3%82%A9%E3%83%AA%E3%82%AA',
        destination: '/tags/portfolio',
        permanent: true,
      },
      {
        source: '/tags/%E7%B5%B5%E6%96%87%E5%AD%97',
        destination: '/tags/emoji',
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
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'",
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
