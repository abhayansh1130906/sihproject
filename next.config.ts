import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) {
      return [
        {
          source: "/api/:path*",
          destination: `${backendUrl.replace(/\/$/, "")}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
