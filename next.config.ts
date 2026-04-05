import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["recharts"],
  serverExternalPackages: ["unpdf"],
};

export default nextConfig;
