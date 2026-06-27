import Link from "@portal/components/Link";
import { Avatar } from "./Avatar";
import { profileHref } from "@portal/lib/profileHref";
import type { StarBoardRow } from "@portal/lib/queries";

export function StarBoard({
  total,
  rows,
  limit,
}: {
  total: number;
  rows: StarBoardRow[];
  limit?: number;
}) {
  const shown = limit ? rows.slice(0, limit) : rows;
  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-[64px] leading-none font-extrabold text-midnight-harbor">
          {total.toLocaleString()}
        </div>
        <div className="meta mt-1">stars crowdsourced by the cohort ⭐</div>
      </div>
      {shown.length === 0 ? (
        <div className="meta text-center py-6">
          No stars traded yet. Tick &ldquo;trade stars&rdquo; on a submission and
          watch them roll in.
        </div>
      ) : (
        <ol className="space-y-1">
          {shown.map((r, i) => {
            const inner = (
              <>
                <span className="w-6 text-center font-bold text-pale-steel shrink-0">
                  {i + 1}
                </span>
                <Avatar src={r.author.avatarUrl} name={r.author.name} size={32} />
                <span className="flex-1 font-semibold truncate">
                  {r.author.name}
                </span>
                <span className="badge">{r.stars} ⭐</span>
              </>
            );
            return r.author.profileId ? (
              <li key={r.author.userId}>
                {/* prefetch={false}: leaderboard rows are a list; avoid an RSC
                    prefetch per row as the board scrolls into view. */}
                <Link
                  href={profileHref(r.author)}
                  prefetch={false}
                  className="flex items-center gap-3 py-2 px-3 rounded-2xl hover:bg-ice-tint transition-colors"
                >
                  {inner}
                </Link>
              </li>
            ) : (
              <li
                key={r.author.userId}
                className="flex items-center gap-3 py-2 px-3 rounded-2xl"
              >
                {inner}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
