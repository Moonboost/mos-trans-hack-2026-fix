import type { NextConfig } from "next";

const BACKEND = process.env.API_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.75.101"],
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
