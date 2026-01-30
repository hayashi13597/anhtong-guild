import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,

  output: "export",

  compiler: {
    removeConsole: true
  }
};

export default nextConfig;
