import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  // Turbopack will use tsconfig.json paths for aliasing
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
