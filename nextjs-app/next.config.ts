import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for serverless deployment
  output: 'standalone',
  
  // Enable experimental features for better performance
  experimental: {
    // Enable static optimization
    optimizePackageImports: ['@/components'],
  },
  
  // Image optimization for serverless
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables configuration
  env: {
    CUSTOM_KEY: 'copilot-playground',
  },
};

export default nextConfig;
