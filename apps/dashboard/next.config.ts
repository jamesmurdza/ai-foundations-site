import type { NextConfig } from "next";

// Multi-zone served under /dashboard on aifoundations.school. basePath prefixes
// routes, <Link>/router navigation, and _next assets. Keep in sync with BASE_PATH
// in src/lib/paths.ts (for client fetch / raw <a> that basePath does not prefix).
const nextConfig: NextConfig = {
  basePath: "/dashboard",
};

export default nextConfig;
