import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  // Recommended for Railway / Docker: smaller output, single server
  output: "standalone",
};

export default nextConfig;
