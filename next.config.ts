import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 public bucket — covers and any future images
        protocol: 'https',
        hostname: 'pub-44ec9e1097054bae94216390e4d2ab45.r2.dev',
      },
      {
        // YouTube thumbnails — kept as fallback
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },
};

export default nextConfig;
