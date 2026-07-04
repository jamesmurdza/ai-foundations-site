import Link from "@portal/components/Link";
import { notFound, redirect } from "@portal/lib/nav";
import { getSessionContext } from "@portal/lib/auth";
import {
  getSubmissionDetail,
  listComments,
  listMentionablePeople,
  listStarredRepoKeys,
  getAssignmentForWeekNumber,
} from "@portal/lib/queries";
import { getRepoReadmeHtml } from "@portal/lib/github";
import { parseRepo, parseLogin } from "@portal/lib/github-parse";
import { getAttachmentsFor } from "@portal/lib/files";
import { CommentThread } from "@portal/components/CommentThread";
import { AttachmentList } from "@portal/components/AttachmentList";
import { SubmissionFeedPost } from "@portal/components/SubmissionFeedPost";
import { LikeButton } from "@portal/components/LikeButton";
import { MessageCircle } from "lucide-react";
import { Avatar } from "@portal/components/Avatar";
import { timeAgo } from "@portal/lib/format";
import { profileHref } from "@portal/lib/profileHref";
import type { Author, ShowcaseItem } from "@portal/lib/queries";
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
  const { submission: s, author, assignment, week, starCount } = detail;

  const [{ user, profile }, comments, subFiles, people] = await Promise.all([
    getSessionContext(),
    listComments("submission", id),
    getAttachmentsFor("submission", id),
    listMentionablePeople(),
  ]);

  // The work rendered "just like Discover": the repo README as GitHub markdown.
  let readmeHtml: string | null = null;
  if (s.repoOwner && s.repoName) {
    readmeHtml = await getRepoReadmeHtml(s.repoOwner, s.repoName);
  } else if (s.payloadType !== "text" && !parseRepo(s.payload)) {
    // A GitHub profile link (Week 1) — preview the {login}/{login} README.
    const login = parseLogin(s.payload);
    if (login) readmeHtml = await getRepoReadmeHtml(login, login);
  }

  const isOwner = user?.id === s.userId;
  const canInteract = Boolean(user && profile);
  const isRepo = Boolean(s.repoOwner && s.repoName);
  const likedRepos =
    user && isRepo ? await listStarredRepoKeys(user.id) : new Set<string>();
  const liked = isRepo && likedRepos.has(`${s.repoOwner}/${s.repoName}`);
  const canLike = Boolean(user?.accessToken) && isRepo && !isOwner;
  // "2d" rather than "2d ago" — the terse Instagram-style timestamp.
  const posted = timeAgo(s.createdAt).replace(" ago", "");

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

  // Reuse the Discover feed post so the submission body looks identical here.
  const feedItem: ShowcaseItem = {
    submission: s,
    author,
    assignmentTitle: assignment?.title ?? "Submission",
    weekNumber: week?.number ?? 0,
    feedbackCount: 0,
    commentCount: comments.length,
    starCount,
  };

  return (
    <div className="py-2">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* The post — left */}
        <div>
          <SubmissionFeedPost
            item={feedItem}
            readmeHtml={readmeHtml}
            liked={liked}
            canLike={canLike}
            hideHeader
            hideActions
          />

          {s.notes && (
            <p className="meta mt-5 whitespace-pre-wrap">{s.notes}</p>
          )}

          <AttachmentList items={subFiles} title="Files" />
        </div>

        {/* Comments — right, kept minimal, Instagram-style. The author header
            lives here now, with the owner's Edit button on the opposite side. */}
        <aside
          id="comments"
          className="scroll-mt-24 lg:sticky lg:top-6 border-t border-border pt-5 lg:border-t-0 lg:pt-0"
        >
          {isOwner && (
            <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-border bg-muted px-4 py-3 text-[14px]">
              <span>You submitted this.</span>
              {assignment && week && (
                <Link
                  href={weekAssignmentHomePath(week.id)}
                  className="link font-semibold"
                >
                  Edit it
                </Link>
              )}
            </div>
          )}
          <div className="flex items-start justify-between gap-3 border-b border-border pb-4 mb-4">
            <Link
              href={profileHref(author)}
              prefetch={false}
              className="flex items-center gap-3 min-w-0"
            >
              <span className="shrink-0">
                <Avatar src={author.avatarUrl} name={author.name} size={36} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-[14px]">
                  <span className="font-semibold">{author.name}</span>
                  {posted && (
                    <span className="meta-light font-normal"> • {posted}</span>
                  )}
                </div>
                {author.country && (
                  <div className="meta-light text-[12px] truncate">
                    {author.country}
                  </div>
                )}
              </div>
            </Link>
          </div>

          <CommentThread
            targetType="submission"
            targetId={s.id}
            comments={comments}
            canComment={canInteract}
            currentUser={currentUser}
            people={people}
            minimal
            actions={
              <div className="flex items-center gap-5">
                {isRepo && (
                  <LikeButton
                    submissionId={s.id}
                    count={starCount}
                    liked={liked}
                    canLike={canLike}
                  />
                )}
                <Link
                  href={`/submissions/${s.id}#comments`}
                  prefetch={false}
                  className="flex items-center gap-1.5 text-[15px] text-slate-channel hover:text-signal-blue"
                >
                  <MessageCircle size={18} />
                  <span className="font-semibold">{comments.length}</span>
                </Link>
              </div>
            }
          />
        </aside>
      </div>
    </div>
  );
}
