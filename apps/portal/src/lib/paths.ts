// Single source of truth for the portal's basePath, mirroring `basePath` in
// next.config.ts. basePath auto-prefixes <Link>, useRouter, redirect() and
// _next assets — but NOT raw <a href>, <form action>, or next/image src. Use
// withBase() in exactly those places so links resolve under /portal.
//
// Keep BASE_PATH identical to basePath in next.config.ts.
export const BASE_PATH = "/portal";

/** Prefix an app-absolute path with the basePath (for raw <a>/<form>/<img>). */
export function withBase(path: string): string {
  if (!path.startsWith("/")) return `${BASE_PATH}/${path}`;
  return `${BASE_PATH}${path}`;
}
