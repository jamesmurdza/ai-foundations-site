import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "@dashboard/components/Link";

import { NotificationsBell } from "@dashboard/components/NotificationsBell";
import { ThemeToggle } from "@dashboard/components/ThemeToggle";
import { resolveAdmin } from "@dashboard/lib/portal-auth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  // Defense-in-depth: every dashboard page is wrapped by AdminShell, so even if
  // the proxy matcher ever misses a route, auth is still enforced here against the
  // shared Portal session. Identity comes from the verified session, not a header.
  const store = await cookies();
  const admin = await resolveAdmin(store.get("ss_session")?.value);
  if (!admin) redirect(`${SITE_URL}/portal/login`);
  const adminUser = admin.githubLogin ?? admin.email ?? "admin";

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
