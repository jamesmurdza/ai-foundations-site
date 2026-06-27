"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { Avatar } from "./Avatar";

// Top-right account menu: click the avatar for a dropdown with Profile + Sign out.
// (Editing your profile lives on the profile page itself.)
export function UserMenu({
  avatarUrl,
  name,
  profileHref,
}: {
  avatarUrl?: string | null;
  name?: string | null;
  profileHref: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="rounded-full block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar src={avatarUrl} name={name} size={36} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-44 card !p-1.5 z-50"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <Link
            href={profileHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-[9px] px-3 py-2 text-[15px] hover:bg-ice-tint"
          >
            <User size={17} aria-hidden /> Profile
          </Link>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              role="menuitem"
              className="w-full flex items-center gap-2.5 rounded-[9px] px-3 py-2 text-[15px] text-left hover:bg-ice-tint"
            >
              <LogOut size={17} aria-hidden /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
