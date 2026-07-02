import Link from "@portal/components/Link";
import { Heart, MessageCircle } from "lucide-react";
import { requireOnboardedUser } from "@portal/lib/auth";
import { listSubmissionsByUser } from "@portal/lib/queries";
import { weekSubmissionPath } from "@portal/lib/weekRoutes";

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
            // The whole card links back to this week's submission form on Home
            // (the /submissions/week-N route redirects there). Comments live on
            // the submission's own page, reached from the showcase feed.
            const href =
              item.weekNumber > 0 ? weekSubmissionPath(item.weekNumber) : "/home";
            // Comments/likes live on the submission's own page — the icon row
            // sits under the card so it stays clickable (a link can't nest
            // inside the card's own link).
            const commentsHref = `/submissions/${s.id}#comments`;
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
