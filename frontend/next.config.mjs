/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    tarkovHourly: {
      stale: 300,
      revalidate: 3600,
      expire: 3600,
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "assets.tarkov.dev" }],
  },
};

export default nextConfig;
