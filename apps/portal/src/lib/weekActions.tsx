import { Sparkles, ClipboardList, type LucideIcon } from "lucide-react";
import { weekAssignmentHomePath } from "@/lib/weekRoutes";

// Per-week "unlocked actions". Instead of dumping every feature into the nav,
// each week's Check-in surfaces only the handful of actions that belong to it.
// Keyed by week number; edit here to retheme a week. Code-driven on purpose —
// no migration, easy to reshuffle while the program is still a draft.
export type WeekAction = {
  key: string;
  icon: LucideIcon;
  title: string;
  blurb: string;
  cta: { label: string; href: string };
};

export const WEEK_ACTIONS: Record<number, WeekAction[]> = {
  // Every program week is a guided two-page wizard (see WeekWizard and the
  // per-week *Steps components). The wizard carries the week's title, goal and
  // checklist, and the social follow-ups (peer feedback, Trade Stars, PR review)
  // live on its congrats screen — so no week shows a separate soft-action
  // checklist above the wizard. The map stays for any future non-wizard week.
  1: [],
  2: [],
  3: [],
  4: [],
};

export const FALLBACK_ACTION: WeekAction = {
  key: "explore",
  icon: Sparkles,
  title: "Make this week count",
  blurb:
    "Jump into this week's assignment, ship something, and support the cohort.",
  cta: { label: "Discover the cohort", href: "/discover" },
};

export function actionsForWeek(weekNumber: number): WeekAction[] {
  return WEEK_ACTIONS[weekNumber] ?? [FALLBACK_ACTION];
}

/* ---------------------------------------------------------------------------
   Week steps — the ordered checklist shown on the Check-in / week page.
   The week's soft actions come first; the real assignment(s) are appended as
   the final step(s) so "ship your work" always reads as the last thing to do.
--------------------------------------------------------------------------- */
export type WeekStep = {
  key: string;
  icon: LucideIcon;
  title: string;
  blurb: string;
  href: string;
  ctaLabel: string;
  /** true = the participant has clearly completed it; drives the ✓ vs number. */
  done: boolean;
};

export type StepAssignment = {
  id: string;
  title: string;
  prompt: string;
  submitted: boolean;
};

export type StepSignals = {
  /** has followed at least one peer on GitHub */
  followedPeers: boolean;
  /** has left feedback on at least one peer profile */
  reviewedProfiles: boolean;
  /** Trade Stars opt-in is on */
  tradeStarsOn: boolean;
};

/** Maps a soft action's key to whether we can prove it's done. Unknown → false. */
function actionDone(key: string, s: StepSignals): boolean {
  switch (key) {
    case "follow-peers":
      return s.followedPeers;
    case "review-profiles":
    case "profile-feedback":
      return s.reviewedProfiles;
    case "star-repos":
      return s.tradeStarsOn;
    default:
      return false;
  }
}

export function buildWeekSteps(opts: {
  weekNumber: number;
  weekId: string;
  assignments: StepAssignment[];
  signals: StepSignals;
}): WeekStep[] {
  const soft: WeekStep[] = actionsForWeek(opts.weekNumber).map((a) => ({
    key: a.key,
    icon: a.icon,
    title: a.title,
    blurb: a.blurb,
    href: a.cta.href,
    ctaLabel: a.cta.label,
    done: actionDone(a.key, opts.signals),
  }));

  const work: WeekStep[] = opts.assignments.map((a) => ({
    key: `assignment-${a.id}`,
    icon: ClipboardList,
    title: a.title,
    blurb: a.prompt,
    href: weekAssignmentHomePath(opts.weekId),
    ctaLabel: a.submitted ? "View / resubmit" : "Open assignment",
    done: a.submitted,
  }));

  return [...soft, ...work];
}

/** User override wins; otherwise fall back to auto-detected completion. */
export function resolveStepDone(
  stepKey: string,
  suggestedDone: boolean,
  overrides: ReadonlyMap<string, boolean>,
): boolean {
  const saved = overrides.get(stepKey);
  if (saved !== undefined) return saved;
  return suggestedDone;
}
