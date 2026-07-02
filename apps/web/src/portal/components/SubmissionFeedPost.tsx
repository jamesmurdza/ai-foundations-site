import Link from "@portal/components/Link";
import { FolderGit2, ExternalLink, MessageCircle, User } from "lucide-react";
import { Avatar } from "./Avatar";
import { LikeButton } from "./LikeButton";
import { timeAgo } from "@portal/lib/format";
import { profileHref } from "@portal/lib/profileHref";
import { parseRepo, parseLogin } from "@portal/lib/github-parse";
import type { ShowcaseItem } from "@portal/lib/queries";

/** "github.com/taniya" rather than a bare "github.com" — more to read. */
function destLabel(url: string) {
  try {
    const u = new URL(url);
    return u.host.replace(/^www\./, "") + u.pathname.replace(/\/+$/, "");
  } catch {
    return url;
  }
}

/**
 * One post in the showcase feed — an Instagram-style take on a submission.
 * Header, then the work as the "photo" (a README gist that opens the repo),
 * and a like (real GitHub star) + comment row. Comments themselves live on the
 * post's detail page, just like Instagram's feed.
 */
export function SubmissionFeedPost({
  item,
  gist,
  liked,
  canLike,
}: {
  item: ShowcaseItem;
  gist: string | null;
  liked: boolean;
  canLike: boolean;
}) {
  const { submission: s, author, commentCount } = item;
  const starCount = item.starCount ?? 0;
  const externalHref = s.payloadType === "text" ? null : s.payload;
  const hasRepo = Boolean(s.repoOwner && s.repoName);
  // A profile post: a stored profile-README repo (<login>/<login>) or a bare
  // profile link. Shown as @login; project repos show owner/name.
  const profileLogin =
    hasRepo && s.repoOwner === s.repoName
      ? s.repoOwner
      : !hasRepo && externalHref && !parseRepo(externalHref)
        ? parseLogin(externalHref)
        : null;
  const isProfile = Boolean(profileLogin);
  const label = isProfile
    ? `@${profileLogin}`
    : hasRepo
      ? `${s.repoOwner}/${s.repoName}`
      : externalHref
        ? destLabel(externalHref)
        : "";
  const SourceIcon = isProfile ? User : hasRepo ? FolderGit2 : ExternalLink;

  return (
    <article className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3">
        <Link
          href={profileHref(author)}
          prefetch={false}
          className="flex items-center gap-3 min-w-0"
        >
          <Avatar src={author.avatarUrl} name={author.name} size={40} />
          <div className="min-w-0">
            <div className="font-bold truncate">{author.name}</div>
            <div className="meta-light text-[12px] truncate">
              {item.assignmentTitle}
              {item.weekNumber > 0 ? ` · Week ${item.weekNumber}` : ""}
            </div>
          </div>
        </Link>
        <span className="meta-light text-[12px] shrink-0">{timeAgo(s.createdAt)}</span>
      </div>

      {/* "Photo" — README gist, clickable to open the repo */}
      {externalHref ? (
        <a
          href={externalHref}
          target="_blank"
          rel="noreferrer"
          className="block"
        >
          <div className="rounded-xl bg-ice-tint/60 p-5">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-channel mb-2">
              <SourceIcon size={15} className="shrink-0" />
              <span className="truncate">{label}</span>
              <ExternalLink size={13} className="opacity-50 shrink-0 ml-auto" />
            </div>
            {gist ? (
              <p className="text-[14px] leading-relaxed text-foreground/80 line-clamp-4">
                {gist}
              </p>
            ) : (
              <p className="meta text-[14px]">{destLabel(externalHref)} →</p>
            )}
          </div>
        </a>
      ) : (
        <div>
          <div className="rounded-xl bg-ice-tint/60 p-5">
            <p className="meta whitespace-pre-wrap line-clamp-6 text-[14px]">
              {s.payload}
            </p>
          </div>
        </div>
      )}

      {/* Actions — GitHub stars only apply to repo posts; profile links can’t be starred. */}
      <div className="flex items-center gap-5 pt-3">
        {hasRepo && (
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
          <MessageCircle size={20} />
          <span className="font-semibold">{commentCount}</span>
        </Link>
      </div>
    </article>
  );
}
