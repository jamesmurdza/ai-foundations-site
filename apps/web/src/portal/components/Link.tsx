import NextLink from "next/link";
import type { ComponentProps } from "react";
import { BASE_PATH } from "@portal/lib/paths";

// Drop-in for next/link that prefixes the portal's BASE_PATH onto internal,
// root-relative hrefs (this app has no Next basePath; the prefix comes from the
// route directory). Idempotent; skips external/relative/already-prefixed hrefs.
function prefix(p: string): string {
  if (!p.startsWith("/")) return p; // external, hash, or relative
  if (p === BASE_PATH || p.startsWith(`${BASE_PATH}/`)) return p; // already prefixed
  return `${BASE_PATH}${p}`;
}

type Props = ComponentProps<typeof NextLink>;

export default function Link({ href, ...rest }: Props) {
  const next =
    typeof href === "string"
      ? prefix(href)
      : href && typeof href === "object" && typeof href.pathname === "string"
        ? { ...href, pathname: prefix(href.pathname) }
        : href;
  return <NextLink href={next} {...rest} />;
}
