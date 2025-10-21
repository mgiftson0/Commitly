import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Disable ESLint during builds (can be enabled later)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during builds (can be enabled later)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Output configuration
  output: "standalone",

  // Set the workspace root to avoid multiple lockfiles warning
  outputFileTracingRoot: __dirname,

  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
};

export default nextConfig;
