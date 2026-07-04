import "github-markdown-css/github-markdown-light.css";
import Link from "@portal/components/Link";
import { MessageCircle } from "lucide-react";
import { Avatar } from "./Avatar";
import { LikeButton } from "./LikeButton";
import { SubmissionReadme } from "./SubmissionReadme";
import { timeAgo } from "@portal/lib/format";
import { profileHref } from "@portal/lib/profileHref";
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
 * Header, then the work as the "photo" (the repo's README rendered as real
 * GitHub-flavored markdown), and a like (real GitHub star) + comment row.
 * Comments themselves live on the post's detail page, just like Instagram.
 */
export function SubmissionFeedPost({
  item,
  readmeHtml,
  liked,
  canLike,
  hideHeader = false,
}: {
  item: ShowcaseItem;
  readmeHtml: string | null;
  liked: boolean;
  canLike: boolean;
  /** The submission page shows the author header in its comments column instead. */
  hideHeader?: boolean;
}) {
  const { submission: s, author, commentCount } = item;
  const starCount = item.starCount ?? 0;
  const externalHref = s.payloadType === "text" ? null : s.payload;
  const hasRepo = Boolean(s.repoOwner && s.repoName);
  // "2d" rather than "2d ago" — the terse Instagram-style timestamp.
  const posted = timeAgo(s.createdAt).replace(" ago", "");

  return (
    <article className="overflow-hidden">
      {/* Header */}
      {!hideHeader && (
        <div className="pb-3">
          <Link
            href={profileHref(author)}
            prefetch={false}
            className="flex items-center gap-3 min-w-0"
          >
            <span className="ml-2 shrink-0">
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
                <div className="meta-light text-[12px] truncate">{author.country}</div>
              )}
            </div>
          </Link>
        </div>
      )}

      {/* The work — the repo's README rendered as real GitHub markdown, in a
          thin-bordered frame (no rounding, no fill) like an Instagram photo. */}
      <div className="border border-border">
        {readmeHtml ? (
          <SubmissionReadme html={readmeHtml} />
        ) : externalHref ? (
          <a
            href={externalHref}
            target="_blank"
            rel="noreferrer"
            className="link block p-5 text-[14px]"
          >
            {destLabel(externalHref)} →
          </a>
        ) : (
          <p className="meta whitespace-pre-wrap line-clamp-6 p-5 text-[14px]">
            {s.payload}
          </p>
        )}
      </div>

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
          <MessageCircle size={18} />
          <span className="font-semibold">{commentCount}</span>
        </Link>
      </div>
    </article>
  );
}
