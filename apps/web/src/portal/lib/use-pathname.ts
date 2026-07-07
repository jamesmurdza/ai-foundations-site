"use client";

import { usePathname as useNextPathname } from "next/navigation";
import { BASE_PATH } from "./paths";

// usePathname that strips the portal's BASE_PATH so client components compare
// against portal-logical paths ("/home", "/admin/people") instead of the real
// "/portal/..." URL (this app has no Next basePath, so the segment is real).
// Without this, every `usePathname() === "/home"` check would silently never
// match. Lives in its own "use client" module so the server-safe nav shim
// (redirect/permanentRedirect) never statically imports a client-only hook.
export function usePathname(): string {
  const p = useNextPathname();
  if (p === BASE_PATH) return "/";
  if (p.startsWith(`${BASE_PATH}/`)) return p.slice(BASE_PATH.length);
  return p;
}
