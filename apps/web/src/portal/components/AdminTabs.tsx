"use client";

import Link from "@portal/components/Link";
import { usePathname } from "@portal/lib/use-pathname";

const TABS: [string, string][] = [
  ["Stream", "/admin"],
  ["Classwork", "/admin/classwork"],
  ["Weeks & stream", "/admin/weeks"],
  ["People", "/admin/people"],
  ["Team", "/admin/team"],
  ["Email", "/admin/email"],
];

export function AdminTabs() {
  const path = usePathname();
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-sea-fog mb-8">
      {TABS.map(([label, href]) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-3 text-[14px] font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
              active
                ? "border-signal-blue text-signal-blue"
                : "border-transparent text-slate-channel hover:text-midnight-harbor"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
