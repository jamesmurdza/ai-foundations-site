import Link from "@portal/components/Link";
import { Heart, MessageCircle, SquarePen, ArrowRight } from "lucide-react";
import { requireOnboardedUser } from "@portal/lib/auth";
import {
  listSubmissionsByUser,
  listWeeks,
  listAllAssignments,
} from "@portal/lib/queries";
import { weekAssignmentHomePath } from "@portal/lib/weekRoutes";

// The lessons hub — one card per program week. This is the portal's landing;
// each card opens that week's lesson at /lessons/[week].
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

  return (
    <div className="py-2">
      <h1 className="text-[30px] md:text-[34px] font-semibold leading-tight text-center mb-8">
        Welcome to AI Summer School
      </h1>
      <div className="grid mx-auto max-w-[820px] gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
        {cards.map(({ week, assignment, item }) => {
          // A week with no assignment (Week 0 welcome) — an "open" card that
          // links to that week's page rather than a submission.
          if (!assignment) {
            return (
              <div key={week.id} className="flex flex-col gap-2">
                <Link
                  href={`/lessons/${week.id}`}
                  className="card flex flex-1 flex-col items-center justify-center min-h-[176px] text-center"
                >
                  <span className="meta-light text-[12px] mb-1">
                    Week {week.number}
                  </span>
                  <span className="font-semibold text-[17px] leading-snug text-balance">
                    {week.theme}
                  </span>
                </Link>
                <div className="flex items-center justify-end meta-light text-[13px] px-1">
                  <Link
                    href={`/lessons/${week.id}`}
                    prefetch={false}
                    className="flex items-center hover:text-signal-blue"
                    aria-label={`Open ${week.theme}`}
                  >
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            );
          }

          // Not started yet — a quiet, disabled card the user can still pick up.
          if (!item) {
            return (
              <div key={assignment.id} className="flex flex-col gap-2">
                <div className="card flex flex-1 flex-col items-center justify-center min-h-[176px] text-center opacity-60">
                  <span className="meta-light text-[12px] mb-1">
                    Week {week.number}
                  </span>
                  <span className="font-semibold text-[17px] leading-snug text-balance text-slate-channel">
                    {assignment.title}
                  </span>
                </div>
                <div className="flex items-center justify-end meta-light text-[13px] px-1">
                  <Link
                    href={weekAssignmentHomePath(assignment.weekId)}
                    prefetch={false}
                    className="flex items-center hover:text-signal-blue"
                    aria-label={`Start ${assignment.title}`}
                  >
                    <SquarePen size={15} />
                  </Link>
                </div>
              </div>
            );
          }

          const s = item.submission;
          // The whole card opens the submission's own page (post + comments).
          const href = `/submissions/${s.id}#comments`;
          return (
            <div key={s.id} className="flex flex-col gap-2">
              <Link
                href={href}
                className="card flex flex-1 flex-col items-center justify-center min-h-[176px] text-center"
              >
                <span className="meta-light text-[12px] mb-1">
                  Week {item.weekNumber}
                </span>
                <span className="font-semibold text-[17px] leading-snug text-balance">
                  {item.assignmentTitle || "Submission"}
                </span>
              </Link>
              <div className="flex items-center justify-start gap-5 meta-light text-[13px] px-1">
                <Link
                  href={href}
                  prefetch={false}
                  className="flex items-center gap-1.5 hover:text-signal-blue"
                  aria-label="View likes and comments"
                >
                  <Heart size={16} />
                  {item.starCount ?? 0}
                </Link>
                <Link
                  href={href}
                  prefetch={false}
                  className="flex items-center gap-1.5 hover:text-signal-blue"
                  aria-label="View comments"
                >
                  <MessageCircle size={16} />
                  {item.commentCount}
                </Link>
                {item.weekId && (
                  <Link
                    href={weekAssignmentHomePath(item.weekId, { edit: true })}
                    prefetch={false}
                    className="ml-auto flex items-center hover:text-signal-blue"
                    aria-label="Edit submission"
                  >
                    <SquarePen size={15} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
