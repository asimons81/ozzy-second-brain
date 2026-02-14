import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NEXT_OUTPUT_MODE === 'export' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  // Removed basePath for custom domain deployment
};

export default nextConfig;
