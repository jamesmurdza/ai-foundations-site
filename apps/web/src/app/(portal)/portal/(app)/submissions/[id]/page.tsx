import Link from "@portal/components/Link";
import { notFound, redirect } from "@portal/lib/nav";
import { getSessionContext } from "@portal/lib/auth";
import {
  getSubmissionDetail,
  listComments,
  listMentionablePeople,
  getAssignmentForWeekNumber,
} from "@portal/lib/queries";
import { getAttachmentsFor } from "@portal/lib/files";
import { CommentThread } from "@portal/components/CommentThread";
import { AttachmentList } from "@portal/components/AttachmentList";
import { Avatar } from "@portal/components/Avatar";
import { timeAgo } from "@portal/lib/format";
import { profileHref } from "@portal/lib/profileHref";
import type { Author } from "@portal/lib/queries";
import { parseWeekRouteParam, weekAssignmentHomePath } from "@portal/lib/weekRoutes";

export default async function SubmissionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const weekNumber = parseWeekRouteParam(id);
  if (weekNumber) {
    const row = await getAssignmentForWeekNumber(weekNumber);
    if (!row) notFound();
    redirect(
      weekAssignmentHomePath(row.week.id, error ? { error } : undefined),
    );
  }

  const detail = await getSubmissionDetail(id);
  if (!detail) notFound();
  const { submission: s, author, assignment, week } = detail;

  const [{ user, profile }, comments, subFiles, people] =
    await Promise.all([
      getSessionContext(),
      listComments("submission", id),
      getAttachmentsFor("submission", id),
      listMentionablePeople(),
    ]);

  const isOwner = user?.id === s.userId;
  const canInteract = Boolean(user && profile);
  const currentUser: Author | null =
    user && profile
      ? {
          userId: user.id,
          name: profile.displayName ?? user.name ?? "You",
          login: user.githubLogin,
          avatarUrl: user.avatarUrl,
          profileId: profile.id,
          country: profile.country,
        }
      : null;

  return (
    <div className="py-2 max-w-[860px]">
      <Link
        href={isOwner ? "/submissions" : "/discover?tab=showcase"}
        className="link text-[14px]"
      >
        {isOwner ? "← Your submissions" : "← Showcase"}
      </Link>
      <div className="flex items-center gap-3 mt-3 mb-4">
        {week && assignment && (
          <Link href={`/weeks/${week.id}`} className="badge badge-muted">
            Week {week.number}
          </Link>
        )}
        {assignment && week && (
          <Link
            href={weekAssignmentHomePath(week.id)}
            className="meta hover:text-signal-blue text-[14px]"
          >
            {assignment.title}
          </Link>
        )}
      </div>

      <div className="card !p-7">
        <div className="flex items-center gap-3 mb-5">
          {author.profileId ? (
            <Link href={profileHref(author)} className="flex items-center gap-3">
              <Avatar src={author.avatarUrl} name={author.name} size={44} />
              <div>
                <div className="font-bold">{author.name}</div>
                <div className="meta-light text-[13px]">{timeAgo(s.createdAt)}</div>
              </div>
            </Link>
          ) : (
            <>
              <Avatar src={author.avatarUrl} name={author.name} size={44} />
              <div>
                <div className="font-bold">{author.name}</div>
                <div className="meta-light text-[13px]">{timeAgo(s.createdAt)}</div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-heading-lg">{s.title || "Submission"}</h1>
          {isOwner && assignment && week && (
            <Link
              href={weekAssignmentHomePath(week.id)}
              className="btn btn-outline btn-sm shrink-0"
            >
              Edit submission
            </Link>
          )}
        </div>

        {s.payloadType === "text" ? (
          <p className="text-[16px] whitespace-pre-wrap">{s.payload}</p>
        ) : (
          <a href={s.payload} target="_blank" rel="noreferrer" className="btn btn-outline">
            {s.repoOwner ? `${s.repoOwner}/${s.repoName}` : "Open submission"} ↗
          </a>
        )}

        {s.notes && <p className="meta mt-4 whitespace-pre-wrap">{s.notes}</p>}

        <AttachmentList items={subFiles} title="Files" />
      </div>

      {/* Comments — the single place peers leave a note */}
      <section id="comments" className="mt-8 card !p-7 scroll-mt-24">
        <CommentThread
          targetType="submission"
          targetId={s.id}
          comments={comments}
          canComment={canInteract}
          currentUser={currentUser}
          people={people}
        />
      </section>
    </div>
  );
}
