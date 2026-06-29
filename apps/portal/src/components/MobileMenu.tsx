"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { withBase } from "@/lib/paths";

export type NavLink = { href: string; label: string };

export function MobileMenu({
  links,
  isAuthed,
  profileHref,
}: {
  links: NavLink[];
  isAuthed: boolean;
  profileHref: string | null;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        data-testid="mobile-menu-button"
        onClick={() => setOpen((v) => !v)}
        className="btn btn-ghost btn-sm !px-2"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div
          className="fixed inset-0 top-16 z-50 overflow-y-auto bg-background"
          data-testid="mobile-menu-panel"
        >
          <nav className="container-page flex flex-col gap-1 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                className="btn btn-ghost justify-start !text-[17px] !py-3"
              >
                {l.label}
              </Link>
            ))}
            <div className="hairline my-3" />
            {isAuthed ? (
              <>
                <Link href="/home" onClick={close} className="btn btn-primary !py-3">
                  Home
                </Link>
                {profileHref && (
                  <Link href={profileHref} onClick={close} className="btn btn-outline !py-3 mt-2">
                    Profile
                  </Link>
                )}
                <form action={withBase("/api/auth/signout")} method="post" className="mt-2">
                  <button type="submit" className="btn btn-ghost justify-start w-full !py-3">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/" onClick={close} className="btn btn-primary !py-3">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
