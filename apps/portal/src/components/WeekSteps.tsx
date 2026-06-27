import {
  listAssignmentsForWeek,
  getUserSubmissionForAssignment,
  countActiveFollows,
  countProfileCommentsBy,
  getWeekStepCompletions,
} from "@/lib/queries";
import { buildWeekSteps, resolveStepDone } from "@/lib/weekActions";
import { WeekStepsList } from "@/components/WeekStepsList";
import type { Week, Profile } from "@/db/schema";

// The ordered "to-do" checklist for a week. Soft actions first, the week's real
// assignment(s) last — participants check steps off manually; auto-detected
// progress (submitted, followed peers, etc.) seeds the initial state until they
// override it.
export async function WeekSteps({
  week,
  userId,
  profile,
  includeAssignments = true,
}: {
  week: Week;
  userId: string;
  profile: Profile;
  includeAssignments?: boolean;
}) {
  const [assignments, followCount, profileComments, completions] =
    await Promise.all([
      includeAssignments ? listAssignmentsForWeek(week.id) : Promise.resolve([]),
      countActiveFollows(userId),
      countProfileCommentsBy(userId),
      getWeekStepCompletions(userId, week.id),
    ]);

  const subs = includeAssignments
    ? await Promise.all(
        assignments.map((a) => getUserSubmissionForAssignment(a.id, userId)),
      )
    : [];

  const steps = buildWeekSteps({
    weekNumber: week.number,
    weekId: week.id,
    assignments: assignments.map((a, i) => ({
      id: a.id,
      title: a.title,
      prompt: a.prompt,
      submitted: Boolean(subs[i]),
    })),
    signals: {
      followedPeers: followCount > 0,
      reviewedProfiles: profileComments > 0,
      tradeStarsOn: profile.tradeStarsEnabled,
    },
  }).map((step) => ({
    key: step.key,
    title: step.title,
    blurb: step.blurb,
    href: step.href,
    ctaLabel: step.ctaLabel,
    done: resolveStepDone(step.key, step.done, completions),
  }));

  if (steps.length === 0) return null;

  return (
    <WeekStepsList
      key={week.id}
      weekId={week.id}
      weekNumber={week.number}
      steps={steps}
    />
  );
}
