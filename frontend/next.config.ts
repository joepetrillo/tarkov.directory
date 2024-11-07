import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "assets.tarkov.dev" }],
  },
  serverExternalPackages: ["@node-rs/argon2"],
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
};

export default nextConfig;
