// Single source of truth for the dashboard's basePath, mirroring `basePath` in
// next.config.ts. basePath auto-prefixes <Link>, useRouter and _next assets — but
// NOT client fetch("/api/..."), raw <a href>, or next/image src. Use withBase()
// in exactly those places so requests resolve under /dashboard.
//
// Keep BASE_PATH identical to basePath in next.config.ts.
export const BASE_PATH = "/dashboard";

/** Prefix an app-absolute path with the basePath (for client fetch / raw <a>). */
export function withBase(path: string): string {
  if (!path.startsWith("/")) return `${BASE_PATH}/${path}`;
  return `${BASE_PATH}${path}`;
}
