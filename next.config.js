/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
        },
      ],
    });
    return config;
  },
  images: {
    disableStaticImages: true,
    domains: ['images.microcms-assets.io', 'storage.googleapis.com'],
  },
};

module.exports = nextConfig;
