/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "assets.tarkov.dev" }],
  },
  serverExternalPackages: ["@node-rs/argon2"],
};

export default nextConfig;
