import Link from "@portal/components/Link";

export type WeekTrailItem = {
  id: string;
  number: number;
  theme: string;
  locked: boolean;
};

/**
 * A quiet, centered program-week trail — `Week 1 · Week 2 · Week 3 · Week 4` —
 * that sits at the top of /home above the week header. The current week is
 * emphasized; other unlocked weeks are muted links that jump straight to them;
 * locked weeks are dimmed and inert. Replaces the old floating page-dots control.
 */
export function WeekTrail({
  weeks,
  activeNumber,
}: {
  weeks: WeekTrailItem[];
  activeNumber: number | null;
}) {
  if (weeks.length === 0) return null;

  return (
    <nav
      aria-label="Program weeks"
      className="mb-6 flex items-center justify-center gap-2 text-[13px] text-slate-channel/75"
    >
      {weeks.map((w, i) => {
        const active = w.number === activeNumber;
        return (
          <span key={w.id} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden className="text-slate-channel/30">
                ·
              </span>
            )}
            {w.locked ? (
              <span
                className="text-slate-channel/35"
                title={`Week ${w.number} — unlocks soon`}
              >
                Week {w.number}
              </span>
            ) : (
              <Link
                href={`/home?week=${w.id}`}
                aria-current={active ? "page" : undefined}
                title={`Week ${w.number} · ${w.theme}`}
                className={
                  active
                    ? "font-semibold text-midnight-harbor"
                    : "transition-colors hover:text-midnight-harbor"
                }
              >
                Week {w.number}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
