import { headers } from "next/headers";
import Link from "@dashboard/components/Link";

import { NotificationsBell } from "@dashboard/components/NotificationsBell";
import { ThemeToggle } from "@dashboard/components/ThemeToggle";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  // Auth is enforced by the proxy (src/proxy.ts): it redirects unauthorised users
  // to /dashboard/login and sets a non-spoofable x-admin-user header (overwriting
  // any client value) for authorised ones. The login page is excluded from the
  // proxy gate, so it arrives here with NO header — render it bare (no admin
  // chrome, and crucially no redirect, which would otherwise loop the login page).
  const adminUser = (await headers()).get("x-admin-user");
  if (!adminUser) return <>{children}</>;

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-hairline/80 bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex h-11 max-w-[1280px] items-center justify-between px-4 sm:px-6 text-[12px] text-ink-80">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <Link
              href="/"
              className="font-semibold tracking-tight text-ink hover:text-action transition-colors truncate"
            >
              Hacker House
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <NotificationsBell />
            <ThemeToggle />
            <span className="hidden sm:inline text-ink-48">Signed in as</span>
            <span className="font-medium text-ink truncate max-w-[10ch]">
              {adminUser}
            </span>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-24 pt-6 sm:pt-10">
        {children}
      </main>
    </>
  );
}
