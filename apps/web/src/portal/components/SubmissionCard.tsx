import Link from "@portal/components/Link";
import { Avatar } from "./Avatar";
import { timeAgo } from "@portal/lib/format";
import { profileHref } from "@portal/lib/profileHref";
import type { ShowcaseItem } from "@portal/lib/queries";

function host(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function SubmissionCard({ item }: { item: ShowcaseItem }) {
  const { submission: s, author } = item;
  return (
    <div className="card card-hover flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {author.profileId ? (
            // prefetch={false}: cards render in long scrollable feeds; default
            // viewport prefetch fires one RSC request per card on scroll.
            <Link href={profileHref(author)} prefetch={false} className="flex items-center gap-2 min-w-0">
              <Avatar src={author.avatarUrl} name={author.name} size={28} />
              <span className="font-semibold text-[14px] truncate">{author.name}</span>
            </Link>
          ) : (
            <>
              <Avatar src={author.avatarUrl} name={author.name} size={28} />
              <span className="font-semibold text-[14px] truncate">{author.name}</span>
            </>
          )}
        </div>
        {item.weekNumber > 0 && <span className="badge-muted badge">Week {item.weekNumber}</span>}
      </div>

      <div>
        <div className="meta-light text-[12px] uppercase tracking-wide">
          {item.assignmentTitle}
        </div>
        <Link href={`/submissions/${s.id}`} prefetch={false} className="font-bold text-[18px] hover:text-signal-blue">
          {s.title || "Submission"}
        </Link>
      </div>

      <div className="text-[14px]">
        {s.payloadType === "text" ? (
          <p className="meta line-clamp-3 whitespace-pre-wrap">{s.payload}</p>
        ) : s.payloadType === "file" ? (
          <a href={s.payload} target="_blank" rel="noreferrer" className="link">
            View file →
          </a>
        ) : (
          <a href={s.payload} target="_blank" rel="noreferrer" className="link break-all">
            {s.repoOwner ? `${s.repoOwner}/${s.repoName}` : host(s.payload)} ↗
          </a>
        )}
      </div>

      <div className="hairline pt-3 flex items-center justify-between meta-light text-[13px]">
        <div className="flex items-center gap-3">
          <span>💬 {item.commentCount}</span>
          {s.tradeStars && <span className="badge">⭐ trading</span>}
          <span>{timeAgo(s.createdAt)}</span>
        </div>
        <Link
          href={`/submissions/${s.id}#comments`}
          prefetch={false}
          className="link"
        >
          {item.commentCount === 0 ? "Be the first 💬" : "Comment →"}
        </Link>
      </div>
    </div>
  );
}
