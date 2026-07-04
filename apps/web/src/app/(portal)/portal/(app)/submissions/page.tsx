import Link from "@portal/components/Link";
import { Heart, MessageCircle, SquarePen } from "lucide-react";
import { requireOnboardedUser } from "@portal/lib/auth";
import {
  listSubmissionsByUser,
  listWeeks,
  listAllAssignments,
} from "@portal/lib/queries";
import { weekAssignmentHomePath } from "@portal/lib/weekRoutes";

export default async function MySubmissionsPage() {
  const { user } = await requireOnboardedUser();
  const [submissions, weeks, assignments] = await Promise.all([
    listSubmissionsByUser(user.id),
    listWeeks(),
    listAllAssignments(),
  ]);

  // One card per program week (published), earliest first. A week the user has
  // submitted shows its submission; a week they haven't shows a disabled card
  // they can still start from — so the whole program is visible at a glance.
  const publishedWeekIds = new Set(
    weeks.filter((w) => w.isPublished).map((w) => w.id),
  );
  const byAssignment = new Map(
    submissions.map((item) => [item.submission.assignmentId, item]),
  );
  const cards = assignments
    .filter((a) => publishedWeekIds.has(a.weekId))
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .map((a) => ({ assignment: a, item: byAssignment.get(a.id) ?? null }));

  return (
    <div className="py-2">
      <div className="mb-8">
        <h1 className="text-[34px] mb-1">Your work</h1>
        <p className="meta">
          Everything you&apos;ve shipped — and the weeks still ahead.
        </p>
      </div>

      {cards.length === 0 ? (
        <p className="meta">
          Nothing here yet —{" "}
          <Link href="/home" className="link">
            start on Home
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          {cards.map(({ assignment, item }) => {
            // Not started yet — a quiet, disabled card the user can still pick up.
            if (!item) {
              return (
                <div key={assignment.id} className="flex flex-col gap-2">
                  <div className="card flex flex-1 flex-col items-center justify-center min-h-[176px] text-center opacity-60">
                    <span className="font-semibold text-[17px] leading-snug text-balance text-slate-channel">
                      {assignment.title}
                    </span>
                    <span className="meta-light text-[12px] mt-1.5">
                      Week {assignment.weekNumber} · Not started
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
            // The whole card opens the submission's own page — the post on the
            // left, comments on the right (jumps straight to the thread).
            const href = `/submissions/${s.id}#comments`;
            const commentsHref = href;
            return (
              <div key={s.id} className="flex flex-col gap-2">
                <Link
                  href={href}
                  className="card flex flex-1 flex-col items-center justify-center min-h-[176px] text-center"
                >
                  <span className="font-semibold text-[17px] leading-snug text-balance">
                    {item.assignmentTitle || "Submission"}
                  </span>
                </Link>
                <div className="flex items-center justify-start gap-5 meta-light text-[13px] px-1">
                  <Link
                    href={commentsHref}
                    prefetch={false}
                    className="flex items-center gap-1.5 hover:text-signal-blue"
                    aria-label="View likes and comments"
                  >
                    <Heart size={16} />
                    {item.starCount ?? 0}
                  </Link>
                  <Link
                    href={commentsHref}
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
      )}
    </div>
  );
}
