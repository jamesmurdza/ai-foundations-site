"use client";

import Link from "@portal/components/Link";
import { usePathname } from "@portal/lib/use-pathname";
import { User, FileText, Settings, type LucideIcon } from "lucide-react";

const SECTIONS: [string, string, LucideIcon][] = [
  ["Profile", "/settings/profile", User],
  ["GitHub README", "/settings/readme", FileText],
  ["Account", "/settings/account", Settings],
];

/** Vertical section nav for the settings area (GitHub-settings style). */
export function SettingsNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {SECTIONS.map(([label, href, Icon]) => {
        const active = path === href || path.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 whitespace-nowrap rounded-[9px] px-3 py-2 text-[14px] font-semibold transition-colors ${
              active
                ? "bg-primary-soft text-primary-strong"
                : "text-slate-channel hover:bg-ice-tint hover:text-midnight-harbor"
            }`}
          >
            <Icon size={17} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
