/** Home path for a week's assignment section — the canonical assignment URL. */
export function weekAssignmentHomePath(
  weekId: string,
  opts?: { error?: string; submitted?: boolean; edit?: boolean },
): string {
  const params = new URLSearchParams();
  params.set("week", weekId);
  if (opts?.error) params.set("error", opts.error);
  if (opts?.submitted) params.set("submitted", "1");
  // `edit=1` reopens the editable form (first page) instead of the post-submit
  // congrats screen the wizard weeks show once a submission exists.
  if (opts?.edit) params.set("edit", "1");
  return `/home?${params.toString()}#assignment`;
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
 * Highest week number a participant may open. Every published week is unlocked
 * for everyone — the program has no week gating, so this is effectively
 * unbounded. Kept as one function (the single source of truth used by /home, the
 * weeks rail, and the showcase) so re-introducing gating later is a one-line
 * change here.
 */
export function maxUnlockedWeek(): number {
  return Number.MAX_SAFE_INTEGER;
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
