import type { NextConfig } from "next";

// This app is a Next.js multi-zone served under /portal on aifoundations.school.
// basePath prefixes all routes, <Link>/router navigation, and _next assets with
// /portal. Keep this in sync with BASE_PATH in src/lib/paths.ts (used for the few
// places basePath does NOT auto-prefix: raw <a>, <form action>, next/image src).
const nextConfig: NextConfig = {
  basePath: "/portal",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
    ],
  },
  experimental: {
    // Admins upload docs via Server Actions; the default cap is 1 MB.
    serverActions: {
      bodySizeLimit: "16mb",
      // Behind the site's /portal rewrite the user-facing Origin is the public
      // domain, not this deployment — allow it so Server Actions aren't rejected.
      allowedOrigins: ["aifoundations.school", "localhost:3000", "localhost:3001"],
    },
    // Client-side router cache TTLs. The dynamic default is 0s (every prefetch
    // re-fetches the moment a link re-enters the viewport), which amplifies
    // scroll-driven RSC traffic. A short TTL lets prefetched payloads be reused.
    staleTimes: { dynamic: 30, static: 300 },
  },
};

export default nextConfig;
