import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.CF_PAGES === '1' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  // Removed basePath for custom domain deployment
};

export default nextConfig;
