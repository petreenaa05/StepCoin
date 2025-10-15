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
      };
    }
    return config;
  },
  // Disable experimental features that might cause issues
  experimental: {
    // Keep stable configuration
    optimizePackageImports: ["@rainbow-me/rainbowkit", "wagmi"],
  },
  // Handle static file serving
  images: {
    domains: ["localhost"],
  },
};

export default nextConfig;
