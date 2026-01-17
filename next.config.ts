import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "export",
};

export default nextConfig;
