/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  agentRules: false,
  // Used by "use cache" / "use cache: remote" on gun pages — independent of backend Map TTL.
  cacheLife: {
    tarkovHourly: {
      stale: 300, // serve stale while revalidating
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
