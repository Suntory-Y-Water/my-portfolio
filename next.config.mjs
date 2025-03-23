/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: 'tsconfig.build.json',
  },
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    domains: ['pub-37c337e4f6b74be784982bc3041040b4.r2.dev'],
    formats: ['image/webp'],
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
};

export default nextConfig;
