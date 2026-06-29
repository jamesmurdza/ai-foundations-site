import Link from "next/link";
import { TreePalm } from "lucide-react";
import { getSessionContext } from "@/lib/auth";
import { UserMenu } from "./UserMenu";
import { MobileMenu, type NavLink } from "./MobileMenu";
import { TopNav } from "./TopNav";

export async function NavBar() {
  const { user, profile } = await getSessionContext();

  // Signed-in participants get the three core pages. Logged-out marketing
  // visitors only see the public Discover page (showcase + directory + map).
  const links: NavLink[] = user
    ? [
        { href: "/home", label: "Home" },
        { href: "/submissions", label: "My Work" },
        { href: "/discover", label: "Discover" },
        ...(user.isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
      ]
    : [{ href: "/discover", label: "Discover" }];
  const profileHref = profile
    ? user?.githubLogin
      ? `/users/${user.githubLogin}`
      : `/profiles/${profile.id}`
    : "/onboarding";
  // Logged-in primary nav lives in the top bar (see TopNav).

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur border-b border-sea-fog">
      <div className="container-page">
        <nav className="flex items-center justify-between h-16 gap-2">
            {/* Brand: logo mark + wordmark. */}
            <Link
              href={user ? "/home" : "/"}
              className="flex items-center gap-2 shrink-0"
            >
              <TreePalm size={22} className="text-primary shrink-0" aria-hidden />
              <span className="font-heading text-lg font-medium tracking-tight">
                Summer School
              </span>
            </Link>

            {/* Right cluster: primary navigation | account. */}
            <div className="flex items-center gap-4">
              {user ? (
                <TopNav links={links} />
              ) : (
                <div className="hidden md:flex items-center gap-1 text-muted-foreground font-medium text-[14px]">
                  {links.map((l) => (
                    <Link key={l.href} href={l.href} className="btn btn-ghost btn-sm">
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Divider separates nav from the account zone. */}
              <span className="hidden md:block h-5 w-px bg-sea-fog" aria-hidden />

              <div className="hidden md:flex items-center gap-2">
                {user ? (
                  <UserMenu
                    avatarUrl={user.avatarUrl}
                    name={profile?.displayName ?? user.name}
                    profileHref={profileHref}
                  />
                ) : (
                  <Link href="/" className="btn btn-primary btn-sm">
                    Sign in
                  </Link>
                )}
              </div>

              <MobileMenu
                links={links}
                isAuthed={Boolean(user)}
                profileHref={user ? profileHref : null}
              />
            </div>
        </nav>
      </div>
    </header>
  );
}
