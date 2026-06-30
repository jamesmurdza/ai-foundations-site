"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type TopNavLink = { href: string; label: string };

// Primary signed-in navigation, rendered inline in the top bar. Replaces the
// former left sidebar and the standalone "Home" button.
export function TopNav({ links }: { links: TopNavLink[] }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="hidden md:flex items-center gap-5">
      {links.map((l) => {
        const active = isActive(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`text-[14px] whitespace-nowrap transition-colors ${
              active
                ? "text-foreground font-semibold"
                : "text-slate-channel hover:text-foreground"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
