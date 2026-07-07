/**
 * The canonical URL for a week's lesson (its own page under /lessons). `edit=1`
 * reopens the editable flow from page 1 instead of the post-submit congrats
 * screen the wizard weeks show once a submission exists.
 */
export function weekAssignmentHomePath(
  weekId: string,
  opts?: { error?: string; submitted?: boolean; edit?: boolean },
): string {
  const params = new URLSearchParams();
  if (opts?.error) params.set("error", opts.error);
  if (opts?.submitted) params.set("submitted", "1");
  if (opts?.edit) params.set("edit", "1");
  const qs = params.toString();
  return `/lessons/${weekId}${qs ? `?${qs}` : ""}`;
}

/** Legacy week submission slug — route handlers redirect this to the homepage. */
export function weekSubmissionPath(weekNumber: number): string {
  return `/submissions/week-${weekNumber}`;
}

/**
 * All four program weeks replace the standard assignment panel with a guided
 * two-page wizard that carries its own title and brief — so the home page skips
 * the redundant theme/description header for them and opens straight into the
 * brief. (Weeks 1: profile, 2: showcase, 3: open source, 4: portfolio.)
 */
export function isWizardWeek(weekNumber: number | null | undefined): boolean {
  return weekNumber != null && weekNumber >= 1 && weekNumber <= 4;
}

/**
 * Highest week number the showcase/weeks-rail will surface. Unbounded — those
 * surfaces list every published week regardless of who's viewing. (Per-user
 * lesson gating is `maxUnlockedWeekNumber` below, a separate concern.)
 */
export function maxUnlockedWeek(): number {
  return Number.MAX_SAFE_INTEGER;
}

/**
 * Sequential lesson gating for one participant. A week may be opened only once
 * every EARLIER program week (a week that has an assignment) has a submission.
 *
 * Returns the highest week NUMBER currently unlocked: the first program week
 * without a submission — that week is open to work on, everything after it is
 * locked. `MAX_SAFE_INTEGER` when every program week is already submitted (all
 * open). Welcome weeks (no assignment) don't gate; their number is always ≤ this.
 */
export function maxUnlockedWeekNumber(
  assignmentWeeks: { number: number; submitted: boolean }[],
): number {
  for (const w of [...assignmentWeeks].sort((a, b) => a.number - b.number)) {
    if (!w.submitted) return w.number;
  }
  return Number.MAX_SAFE_INTEGER;
}

/** A week (by number) is open iff its number is within the unlocked ceiling. */
export function isWeekUnlocked(weekNumber: number, maxUnlocked: number): boolean {
  return weekNumber <= maxUnlocked;
}

/** Parses week-1, week1, etc. Returns null for UUIDs and unknown shapes. */
export function parseWeekRouteParam(param: string): number | null {
  const trimmed = param.trim().toLowerCase();
  if (isSubmissionUuid(trimmed)) return null;
  const match = trimmed.match(/^week-?(\d+)$/);
  if (!match) return null;
  const weekNumber = Number.parseInt(match[1], 10);
  return Number.isFinite(weekNumber) && weekNumber > 0 ? weekNumber : null;
}

export function isSubmissionUuid(param: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    param.trim(),
  );
}
