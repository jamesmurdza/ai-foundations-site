import type { NextConfig } from "next";

// Single unified app — no basePath, no multi-zone rewrites. The three zones live
// under route groups: (site) at /, (portal) at /portal/*, (dashboard) at /dashboard/*.
const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "3000-49ddbbf7-6b4b-476e-864c-d27cd456e7dc.daytonaproxy01.net",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
    ],
  },
  experimental: {
    // Portal admins upload docs via Server Actions; default cap is 1 MB.
    serverActions: { bodySizeLimit: "16mb" },
    staleTimes: { dynamic: 30, static: 300 },
  },
};

export default nextConfig;
