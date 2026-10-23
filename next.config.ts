import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/portal',
        destination: '/portal/index.html',
      },
      {
        source: '/portal/:path*',
        destination: '/portal/index.html',
      },
      {
        source: '/forms/:path*',
        destination: '/portal/index.html',
      },
      {
        source: '/activate/:path*',
        destination: '/portal/index.html',
      },
    ];
  },
};

export default nextConfig;
