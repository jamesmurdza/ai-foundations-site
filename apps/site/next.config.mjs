/** @type {import('next').NextConfig} */

// The site is the multi-zone HOST. It rewrites /portal/* and /dashboard/* to the
// two zone deployments (which each set basePath, so the /portal and /dashboard
// prefixes — including /_next assets — are preserved through to them).
// Set PORTAL_ORIGIN / DASHBOARD_ORIGIN to the zone deploy URLs (or localhost in dev).
const PORTAL_ORIGIN = process.env.PORTAL_ORIGIN || "http://localhost:3001";
const DASHBOARD_ORIGIN = process.env.DASHBOARD_ORIGIN || "http://localhost:3002";

const nextConfig = {
  async rewrites() {
    return [
      { source: "/portal", destination: `${PORTAL_ORIGIN}/portal` },
      { source: "/portal/:path*", destination: `${PORTAL_ORIGIN}/portal/:path*` },
      { source: "/dashboard", destination: `${DASHBOARD_ORIGIN}/dashboard` },
      { source: "/dashboard/:path*", destination: `${DASHBOARD_ORIGIN}/dashboard/:path*` },
    ];
  },
};

export default nextConfig;
