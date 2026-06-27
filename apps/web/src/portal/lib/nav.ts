import {
  redirect as nextRedirect,
  permanentRedirect as nextPermanentRedirect,
} from "next/navigation";
import { BASE_PATH } from "./paths";

// Drop-in for next/navigation's redirect/permanentRedirect that prefixes the
// portal's BASE_PATH onto internal, root-relative paths (no Next basePath here).
// External URLs (e.g. the GitHub OAuth authorize URL) and already-prefixed paths
// pass through unchanged. Everything else from next/navigation is re-exported.
export * from "next/navigation";

function prefix(p: string): string {
  if (typeof p !== "string" || !p.startsWith("/")) return p; // external/relative
  if (p === BASE_PATH || p.startsWith(`${BASE_PATH}/`)) return p; // already prefixed
  return `${BASE_PATH}${p}`;
}

export function redirect(...args: Parameters<typeof nextRedirect>): never {
  const [url, ...rest] = args;
  return nextRedirect(prefix(url), ...rest);
}

export function permanentRedirect(
  ...args: Parameters<typeof nextPermanentRedirect>
): never {
  const [url, ...rest] = args;
  return nextPermanentRedirect(prefix(url), ...rest);
}
