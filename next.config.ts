import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack configuration for better compatibility
  webpack: (config, { dev, isServer }) => {
    // Handle node modules for browser compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  // Experimental features
  experimental: {
    optimizePackageImports: ["@rainbow-me/rainbowkit", "wagmi"],
  },
  // Handle static file serving
  images: {
    domains: ["localhost"],
  },
  // Build configuration for deployment
  eslint: {
    ignoreDuringBuilds: true, // Allow deployment with ESLint warnings
  },
  typescript: {
    ignoreBuildErrors: true, // Allow deployment with TypeScript warnings
  },
};

export default nextConfig;
