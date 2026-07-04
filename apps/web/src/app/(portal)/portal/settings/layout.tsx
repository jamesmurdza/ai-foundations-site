import type { ReactNode } from "react";
import Link from "@portal/components/Link";
import { redirect } from "@portal/lib/nav";
import { getSessionContext } from "@portal/lib/auth";
import { SettingsNav } from "@portal/components/SettingsNav";

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile } = await getSessionContext();
  if (!user) redirect("/login");
  if (!profile) redirect("/onboarding");

  const profileHref = user.githubLogin
    ? `/users/${user.githubLogin}`
    : `/profiles/${profile.id}`;

  return (
    <div className="container-page py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[34px]">Settings</h1>
        <Link href={profileHref} className="link text-[14px]">
          View profile →
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-6">
          <SettingsNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
