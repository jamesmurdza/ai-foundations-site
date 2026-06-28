"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight, Lock } from "lucide-react";

export type WeekRailItem = {
  id: string;
  number: number;
  theme: string;
  locked: boolean;
};

/**
 * A quiet, hover-revealed weeks rail pinned to the left edge. Collapsed it shows
 * just the week numbers (the always-visible hint that tells you where to hover);
 * on hover — or keyboard focus — it slides open to a translucent, frosted-glass
 * panel so the content behind stays visible.
 *
 * Open state is driven by JS (not CSS :hover) on purpose: picking a week sets
 * open=false so the rail collapses the instant you navigate, and because the
 * cursor sitting still over the rail can't re-fire onMouseEnter, it *stays*
 * collapsed — a CSS :hover would re-expand it on the post-navigation re-render.
 *
 * Progressive disclosure per design.md. Desktop only; mobile nav is the top bar.
 */
export function WeekRail({
  weeks,
  currentNumber,
}: {
  weeks: WeekRailItem[];
  currentNumber: number | null;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  if (weeks.length === 0) return null;

  // On /home the viewed week is ?week=<id>; elsewhere fall back to the program's
  // current week so the rail always shows where you are.
  const viewedWeekId = pathname === "/home" ? params.get("week") : null;
  const activeNumber =
    weeks.find((w) => w.id === viewedWeekId)?.number ?? currentNumber;

  return (
    <div className="hidden lg:block">
      <div
        className="fixed left-0 top-1/2 z-30 -translate-y-1/2"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <nav
          aria-label="Weeks"
          onFocus={() => setOpen(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setOpen(false);
            }
          }}
          className={`flex flex-col gap-0.5 overflow-hidden rounded-r-[14px] border border-l-0 border-border/70 bg-background/70 px-1.5 py-3 shadow-card-2 backdrop-blur-xl transition-[width] duration-200 ease-out ${
            open ? "w-60" : "w-14"
          }`}
        >
          <div className="mb-1 flex items-center gap-2 pl-2 text-pale-steel">
            <ChevronRight
              size={16}
              aria-hidden
              className={`shrink-0 transition-transform duration-200 ${
                open ? "translate-x-0.5" : ""
              }`}
            />
            <span
              className={`whitespace-nowrap text-caption font-semibold uppercase tracking-[0.14em] transition-opacity duration-200 ${
                open ? "opacity-100" : "opacity-0"
              }`}
            >
              Weeks
            </span>
          </div>

          {weeks.map((w) => {
            const active = w.number === activeNumber;
            const chip = (
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-[14px] font-semibold transition-colors ${
                  active ? "bg-primary text-white" : "bg-muted text-slate-channel"
                }`}
              >
                {w.number}
              </span>
            );
            const label = (
              <span
                className={`flex min-w-0 flex-col whitespace-nowrap transition-opacity duration-200 ${
                  open ? "opacity-100" : "opacity-0"
                }`}
              >
                <span
                  className={`text-[14px] leading-tight ${
                    active ? "font-semibold text-primary-strong" : "font-medium"
                  }`}
                >
                  Week {w.number}
                </span>
                <span className="meta-light truncate text-[12px] leading-tight">
                  {w.locked ? "Locked" : w.theme}
                </span>
              </span>
            );
            const rowClass = `flex items-center gap-2.5 rounded-[11px] p-1.5 transition-colors ${
              active ? "bg-primary-soft" : "hover:bg-muted/70"
            }`;

            return w.locked ? (
              <div
                key={w.id}
                className={`${rowClass} cursor-default opacity-70`}
                aria-label={`Week ${w.number} — locked`}
                title="Unlocks soon"
              >
                {chip}
                {label}
                <Lock
                  size={13}
                  aria-hidden
                  className={`ml-auto shrink-0 text-pale-steel transition-opacity duration-200 ${
                    open ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            ) : (
              <Link
                key={w.id}
                href={`/home?week=${w.id}`}
                onClick={() => setOpen(false)}
                className={rowClass}
                aria-current={active ? "page" : undefined}
                aria-label={`Week ${w.number}: ${w.theme}`}
                title={`Week ${w.number} · ${w.theme}`}
              >
                {chip}
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
