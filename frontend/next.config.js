/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
  // Workaround for better-auth/react with Next.js 15 + React 19
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'better-auth/react': 'better-auth/react/dist/cjs',
    };
    return config;
  },
};

export default nextConfig;