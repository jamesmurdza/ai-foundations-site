"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type TopNavSubLink = { href: string; label: string };
export type TopNavLink = {
  href: string;
  label: string;
  submenu?: TopNavSubLink[];
};

// Primary signed-in navigation, rendered inline in the top bar. Replaces the
// former left sidebar and the standalone "Home" button. Items with a `submenu`
// reveal a small dropdown on hover/focus (CSS-only, so no client state).
export function TopNav({ links }: { links: TopNavLink[] }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="hidden md:flex items-center gap-5">
      {links.map((l) => {
        const active = isActive(l.href);
        const linkClass = `text-[14px] whitespace-nowrap transition-colors ${
          active
            ? "text-foreground font-semibold"
            : "text-slate-channel hover:text-foreground"
        }`;

        if (!l.submenu) {
          return (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          );
        }

        return (
          <div key={l.href} className="relative group">
            <Link href={l.href} className={linkClass} aria-haspopup="menu">
              {l.label}
            </Link>
            <div className="absolute left-1/2 top-full z-50 hidden -translate-x-1/2 pt-3 group-hover:block focus-within:block">
              <div
                className="card !p-1.5 min-w-[160px]"
                role="menu"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {l.submenu.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    role="menuitem"
                    className="block rounded-[9px] px-3 py-2 text-[14px] text-slate-channel hover:bg-muted hover:text-foreground"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
