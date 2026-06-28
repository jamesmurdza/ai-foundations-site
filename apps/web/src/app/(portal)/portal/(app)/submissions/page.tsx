import Link from "@portal/components/Link";
import { requireOnboardedUser } from "@portal/lib/auth";
import {
  listSubmissionsByUser,
  listComments,
  listMentionablePeople,
} from "@portal/lib/queries";
import { Avatar } from "@portal/components/Avatar";
import { MentionText } from "@portal/lib/mentions";
import { timeAgo } from "@portal/lib/format";

function host(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function MySubmissionsPage() {
  const { user } = await requireOnboardedUser();
  const submissions = await listSubmissionsByUser(user.id);

  // Feedback's single home is here — so each submission carries its own comments
  // inside its box, newest first. No separate aggregated list to keep in sync.
  const [people, commentsPerSubmission] = await Promise.all([
    submissions.length ? listMentionablePeople() : Promise.resolve([]),
    Promise.all(
      submissions.map((s) => listComments("submission", s.submission.id)),
    ),
  ]);
  const mentionHandles = new Set(people.map((p) => p.username));

  return (
    <div className="py-2 mx-auto max-w-[680px]">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[34px] mb-1">Your work</h1>
          <p className="meta">
            Everything you&apos;ve shipped — with the feedback peers left. Open
            any one to keep editing it, even after its deadline.
          </p>
        </div>
        <Link href="/home" className="btn btn-outline btn-sm">
          Home →
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="card meta">
          Nothing submitted yet.{" "}
          <Link href="/home" className="link">
            Go to Home
          </Link>{" "}
          to get on the board.
        </div>
      ) : (
        <div className="space-y-5">
          {submissions.map((item, i) => {
            const s = item.submission;
            const comments = commentsPerSubmission[i];
            return (
              <div key={s.id} className="card flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="meta-light text-[12px] uppercase tracking-wide">
                      {item.assignmentTitle}
                    </div>
                    <Link
                      href={`/submissions/${s.id}`}
                      className="font-bold text-[18px] hover:text-signal-blue"
                    >
                      {s.title || "Submission"}
                    </Link>
                  </div>
                  {item.weekNumber > 0 && (
                    <span className="badge badge-muted shrink-0">
                      Week {item.weekNumber}
                    </span>
                  )}
                </div>

                <div className="text-[14px]">
                  {s.payloadType === "text" ? (
                    <p className="meta line-clamp-3 whitespace-pre-wrap">{s.payload}</p>
                  ) : s.payloadType === "file" ? (
                    <a href={s.payload} target="_blank" rel="noreferrer" className="link">
                      View file →
                    </a>
                  ) : (
                    <a
                      href={s.payload}
                      target="_blank"
                      rel="noreferrer"
                      className="link break-all"
                    >
                      {s.repoOwner ? `${s.repoOwner}/${s.repoName}` : host(s.payload)} ↗
                    </a>
                  )}
                </div>

                {/* Feedback, inside the box. */}
                <div className="hairline pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="meta-light text-[13px]">
                      {comments.length === 0
                        ? "No comments yet"
                        : `${comments.length} comment${comments.length === 1 ? "" : "s"}`}
                    </span>
                    <Link
                      href={`/submissions/${s.id}#comments`}
                      className="link text-[13px]"
                    >
                      {comments.length === 0 ? "Invite feedback →" : "Reply →"}
                    </Link>
                  </div>

                  {comments.length > 0 && (
                    <ul className="space-y-4">
                      {comments.map((c) => (
                        <li key={c.id} className="flex gap-3">
                          <Avatar src={c.author?.avatarUrl} name={c.author?.name} size={32} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[14px]">
                                {c.author?.name}
                              </span>
                              <span className="meta-light text-[12px]">
                                {timeAgo(c.createdAt)}
                              </span>
                            </div>
                            <p className="text-[15px] whitespace-pre-wrap mt-0.5">
                              <MentionText text={c.body} valid={mentionHandles} />
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
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
