import { requireOnboardedUser } from "@portal/lib/auth";
import {
  listSubmissionsByUser,
  listWeeks,
  listAllAssignments,
} from "@portal/lib/queries";
import {
  weekAssignmentHomePath,
  maxUnlockedWeekNumber,
} from "@portal/lib/weekRoutes";
import { WeekCard } from "@portal/components/WeekCard";

// The lessons hub — one card per program week. This is the portal's landing;
// each card opens that week's lesson at /lessons/[week]. Weeks unlock in order:
// a week is locked until the previous week's assignment is submitted.
export default async function LessonsPage() {
  const { user } = await requireOnboardedUser();
  const [submissions, weeks, assignments] = await Promise.all([
    listSubmissionsByUser(user.id),
    listWeeks(),
    listAllAssignments(),
  ]);

  const byAssignment = new Map(
    submissions.map((item) => [item.submission.assignmentId, item]),
  );
  const assignmentByWeek = new Map(assignments.map((a) => [a.weekId, a]));
  const cards = weeks
    .filter((w) => w.isPublished)
    .sort((a, b) => a.number - b.number)
    .map((week) => {
      const assignment = assignmentByWeek.get(week.id) ?? null;
      const item = assignment ? byAssignment.get(assignment.id) ?? null : null;
      return { week, assignment, item };
    });

  // Sequential gating: the ceiling is the first program week without a
  // submission — that one stays open, everything past it locks.
  const maxUnlocked = maxUnlockedWeekNumber(
    cards
      .filter((c) => c.assignment)
      .map((c) => ({ number: c.week.number, submitted: Boolean(c.item) })),
  );

  return (
    <div className="py-2">
      <h1 className="text-[30px] md:text-[34px] font-semibold leading-tight text-center mb-8">
        Welcome to AI Summer School
      </h1>
      <div className="grid mx-auto max-w-[820px] gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
        {cards.map(({ week, assignment, item }, i) => {
          // Week 0 welcome (no assignment) — always open.
          if (!assignment) {
            return (
              <WeekCard
                key={week.id}
                state="welcome"
                number={week.number}
                title={week.theme}
                href={`/lessons/${week.id}`}
              />
            );
          }

          // Already submitted — done, with a green check + edit affordance.
          if (item) {
            const s = item.submission;
            const href = `/submissions/${s.id}#comments`;
            return (
              <WeekCard
                key={s.id}
                state="done"
                number={item.weekNumber}
                title={item.assignmentTitle || "Submission"}
                href={href}
                starCount={item.starCount ?? 0}
                commentCount={item.commentCount}
                editHref={
                  item.weekId
                    ? weekAssignmentHomePath(item.weekId, { edit: true })
                    : href
                }
              />
            );
          }

          // Not submitted and past the unlock ceiling — locked.
          if (week.number > maxUnlocked) {
            return (
              <WeekCard
                key={assignment.id}
                state="locked"
                number={week.number}
                title={assignment.title}
                prevWeekNumber={cards[i - 1]?.week.number ?? week.number - 1}
              />
            );
          }

          // Unlocked but not started — the whole card starts the week.
          return (
            <WeekCard
              key={assignment.id}
              state="todo"
              number={week.number}
              title={assignment.title}
              startHref={weekAssignmentHomePath(assignment.weekId)}
            />
          );
        })}
      </div>
    </div>
  );
}
