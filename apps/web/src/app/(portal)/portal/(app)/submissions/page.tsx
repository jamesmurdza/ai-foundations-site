import Link from "@portal/components/Link";
import { Heart, MessageCircle, SquarePen } from "lucide-react";
import { requireOnboardedUser } from "@portal/lib/auth";
import { listSubmissionsByUser } from "@portal/lib/queries";
import { weekAssignmentHomePath } from "@portal/lib/weekRoutes";

export default async function MySubmissionsPage() {
  const { user } = await requireOnboardedUser();
  const submissions = await listSubmissionsByUser(user.id);

  // Chronological by week (earliest first); the query already tie-breaks by
  // recency, and the sort is stable so that order survives within a week.
  const ordered = [...submissions].sort(
    (a, b) => a.weekNumber - b.weekNumber,
  );

  return (
    <div className="py-2">
      <div className="mb-8">
        <h1 className="text-[34px] mb-1">Your work</h1>
        <p className="meta">Everything you&apos;ve shipped, with peer feedback.</p>
      </div>

      {ordered.length === 0 ? (
        <p className="meta">
          Nothing here yet —{" "}
          <Link href="/home" className="link">
            start on Home
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ordered.map((item) => {
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
