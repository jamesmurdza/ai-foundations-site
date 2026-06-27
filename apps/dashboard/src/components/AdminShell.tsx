import { headers } from "next/headers";
import Link from "next/link";

import { NotificationsBell } from "@/components/NotificationsBell";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const adminUser = h.get("x-admin-user") ?? "admin";

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
            <Link
              href="/admins"
              className="text-ink-80 hover:text-ink transition-colors"
            >
              Admins
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
