import type { ReactNode } from "react";
import Link from "@portal/components/Link";
import { markGoalAchieved } from "@portal/lib/actions/profile";
import { SubmissionCard } from "@portal/components/SubmissionCard";
import { FollowButton } from "@portal/components/FollowButton";
import { Avatar } from "@portal/components/Avatar";
import { SubmitButton } from "@portal/components/SubmitButton";
import { formatDate } from "@portal/lib/format";
import type { Profile } from "@portal/db/schema";
import type { Author, ShowcaseItem } from "@portal/lib/queries";

export type FollowInfo = {
  targetUserId: string;
  targetLogin: string | null;
  viewerSignedIn: boolean;
  viewerConnected: boolean;
  isFollowing: boolean;
};

/**
 * Shared profile renderer. Used by the canonical /users/[githubusername] page
 * (with the GitHub README as `readme` centerpiece) and the legacy /profiles/[id]
 * fallback for participants who haven't connected GitHub (no readme).
 */
export function ProfileView({
  profile,
  author,
  submissions,
  stars,
  isOwner,
  follow,
  readme,
}: {
  profile: Profile;
  author: Author;
  submissions: ShowcaseItem[];
  stars: number;
  isOwner: boolean;
  follow: FollowInfo;
  readme?: ReactNode;
}) {
  const links: [string, string | null][] = [
    ["GitHub", profile.githubUrl],
    ["Website", profile.siteUrl || profile.portfolioUrl],
    ["LinkedIn", profile.linkedinUrl],
    ["X", profile.xUrl],
  ];

  return (
    <div className="container-page py-10 max-w-[1120px]">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
        {/* Main column */}
        <div className="min-w-0">
          {/* Hero */}
          <div className="card !p-7">
            <div className="flex flex-wrap items-start gap-5">
              <Avatar src={author.avatarUrl} name={author.name} size={84} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-heading-lg">{author.name}</h1>
                  {profile.graduate && <span className="badge badge-teal">🎓 Graduate</span>}
                  {profile.achieved && <span className="badge">goal achieved ✓</span>}
                </div>
                {profile.username && (
                  <div className="text-primary font-semibold text-[15px] mt-0.5">
                    @{profile.username}
                  </div>
                )}
                <div className="meta mt-1">
                  {[profile.city, profile.country].filter(Boolean).join(", ")}
                  {profile.country && " · "}
                  {stars} ⭐ earned
                </div>
                {profile.bio && <p className="mt-3 max-w-[60ch]">{profile.bio}</p>}
                <div className="flex flex-wrap gap-2 mt-4">
                  {links.map(([label, href]) =>
                    href ? (
                      <a key={label} href={href} target="_blank" rel="noreferrer" className="pill bg-ice-tint text-slate-channel">
                        {label} ↗
                      </a>
                    ) : null,
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {isOwner ? (
                  <Link href="/profile/edit" className="btn btn-outline btn-sm">Edit</Link>
                ) : (
                  <FollowButton
                    targetUserId={follow.targetUserId}
                    targetLogin={follow.targetLogin}
                    isOwner={isOwner}
                    viewerSignedIn={follow.viewerSignedIn}
                    viewerConnected={follow.viewerConnected}
                    isFollowing={follow.isFollowing}
                  />
                )}
              </div>
            </div>
          </div>

          {/* GitHub README — the centerpiece (mirrors their GitHub profile) */}
          {readme && <div className="mt-6">{readme}</div>}

          {/* Goals */}
          <section className="grid md:grid-cols-2 gap-x-10 gap-y-6 mt-8">
            <div>
              <div className="label">🏅 Proud of</div>
              <p className="text-[16px]">{profile.proudOf || <span className="meta">—</span>}</p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <div className="label">🎯 Wants to achieve</div>
                {profile.achieved && (
                  <span className="badge badge-teal">
                    done {profile.achievedAt ? `· ${formatDate(profile.achievedAt)}` : ""}
                  </span>
                )}
              </div>
              <p className="text-[16px]">{profile.wantToAchieve || <span className="meta">—</span>}</p>
              {isOwner && !profile.achieved && profile.wantToAchieve && (
                <form action={markGoalAchieved} className="mt-3">
                  <SubmitButton className="btn btn-primary btn-sm">Mark achieved 🎉</SubmitButton>
                </form>
              )}
            </div>
          </section>
        </div>

        {/* Projects — sidebar */}
        <aside className="lg:sticky lg:top-6">
          <h2 className="text-heading mb-4">Projects</h2>
          {submissions.length === 0 ? (
            <p className="meta">No projects shipped yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {submissions.map((s) => (
                <SubmissionCard key={s.submission.id} item={s} />
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
