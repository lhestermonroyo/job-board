import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    dynamicIO: true
  },
  devIndicators: false
};

export default nextConfig;
