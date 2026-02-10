import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Removed basePath for custom domain deployment
};

export default nextConfig;
