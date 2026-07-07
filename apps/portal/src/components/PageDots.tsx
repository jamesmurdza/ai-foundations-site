"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export type PageDotItem = {
  id: string;
  number: number;
  theme: string;
  locked: boolean;
};

/**
 * A page control in the spirit of the iPhone home screen: a centered row of
 * dots, one per week, pinned to the bottom of the viewport. The current week is
 * the wide, filled dot; the others are quiet taps that jump straight to that
 * week. Replaces the old hover-revealed weeks rail.
 */
export function PageDots({
  weeks,
  currentNumber,
}: {
  weeks: PageDotItem[];
  currentNumber: number | null;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  // The page control belongs to the open course only — show it on /home (where
  // a week's lesson is open) and never on any other page.
  if (weeks.length === 0 || pathname !== "/home") return null;

  // The viewed week is ?week=<id>; fall back to the program's current week so
  // the active dot always reflects where you are.
  const viewedWeekId = params.get("week");
  const activeNumber =
    weeks.find((w) => w.id === viewedWeekId)?.number ?? currentNumber;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center">
      <nav
        aria-label="Weeks"
        className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-border/70 bg-background/80 px-3.5 py-2 shadow-card-2 backdrop-blur-xl"
      >
        {weeks.map((w) => {
          const active = w.number === activeNumber;
          const dotClass = `block h-2.5 rounded-full transition-all duration-200 ${
            active
              ? "w-6 bg-primary"
              : "w-2.5 bg-slate-channel/35 hover:bg-slate-channel/60"
          }`;

          if (w.locked) {
            return (
              <span
                key={w.id}
                aria-label={`Week ${w.number} — locked`}
                title="Unlocks soon"
                className="block h-2.5 w-2.5 cursor-default rounded-full bg-slate-channel/20"
              />
            );
          }

          return (
            <Link
              key={w.id}
              href={`/home?week=${w.id}`}
              className={dotClass}
              aria-current={active ? "page" : undefined}
              aria-label={`Week ${w.number}: ${w.theme}`}
              title={`Week ${w.number} · ${w.theme}`}
            />
          );
        })}
      </nav>
    </div>
  );
}
