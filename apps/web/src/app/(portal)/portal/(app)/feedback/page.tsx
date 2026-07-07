import Link from "@portal/components/Link";
import { requireOnboardedUser } from "@portal/lib/auth";
import { listPendingReviews, countFeedbackGiven } from "@portal/lib/queries";
import { Avatar } from "@portal/components/Avatar";

export default async function FeedbackPage() {
  const { user } = await requireOnboardedUser();
  const [pending, given] = await Promise.all([
    listPendingReviews(user.id),
    countFeedbackGiven(user.id),
  ]);

  return (
    <div className="py-2 max-w-[760px]">
      <h1 className="text-heading-lg">Reviews to give</h1>
      <p className="meta mt-2 mb-2 max-w-[60ch]">
        You&apos;re randomly matched with submissions to review.
      </p>
      <p className="meta-light text-[14px] mb-8">
        {given} review{given === 1 ? "" : "s"} given so far · {pending.length} waiting
      </p>

      {pending.length === 0 ? (
        <p className="meta">You&apos;re all caught up 🎉</p>
      ) : (
        <ul className="space-y-4">
          {pending.map((p) => (
            <li key={p.reviewAssignmentId} className="card flex items-center gap-4">
              <Avatar src={p.author.avatarUrl} name={p.author.name} size={44} />
              <div className="flex-1 min-w-0">
                <div className="meta-light text-[12px] uppercase tracking-wide">
                  {p.assignmentTitle}
                </div>
                <div className="font-bold truncate">
                  {p.submission.title || "Submission"} · {p.author.name}
                </div>
              </div>
              <Link href={`/submissions/${p.submission.id}`} className="btn btn-primary btn-sm">
                Review →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
