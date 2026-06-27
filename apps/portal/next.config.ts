import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
    ],
  },
  experimental: {
    // Admins upload docs via Server Actions; the default cap is 1 MB.
    serverActions: { bodySizeLimit: "16mb" },
    // Client-side router cache TTLs. The dynamic default is 0s (every prefetch
    // re-fetches the moment a link re-enters the viewport), which amplifies
    // scroll-driven RSC traffic. A short TTL lets prefetched payloads be reused.
    staleTimes: { dynamic: 30, static: 300 },
  },
};

export default nextConfig;
