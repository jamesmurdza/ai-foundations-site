import type { ReactNode } from "react";
import Link from "@portal/components/Link";
import { markGoalAchieved } from "@portal/lib/actions/profile";
import { CommentThread } from "@portal/components/CommentThread";
import { SubmissionCard } from "@portal/components/SubmissionCard";
import { FollowButton } from "@portal/components/FollowButton";
import { Avatar } from "@portal/components/Avatar";
import { CopyButton } from "@portal/components/CopyButton";
import { SubmitButton } from "@portal/components/SubmitButton";
import { formatDate } from "@portal/lib/format";
import type { Profile } from "@portal/db/schema";
import type {
  Author,
  GlowUp,
  ShowcaseItem,
  MentionPerson,
} from "@portal/lib/queries";
import type { Comment } from "@portal/db/schema";

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
  glow,
  submissions,
  comments,
  people,
  stars,
  isOwner,
  canComment,
  currentUser,
  shareUrl,
  follow,
  readme,
}: {
  profile: Profile;
  author: Author;
  glow: GlowUp | null;
  submissions: ShowcaseItem[];
  comments: (Comment & { author: Author })[];
  people: MentionPerson[];
  stars: number;
  isOwner: boolean;
  canComment: boolean;
  currentUser: Author | null;
  shareUrl: string;
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
    <div className="container-page py-10 max-w-[920px]">
      <Link href="/discover" className="link text-[14px]">
        ← Discover
      </Link>
      {/* Hero */}
      <div className="card !p-7 mt-3">
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
      <section className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="card">
          <div className="label">🏅 Proud of</div>
          <p className="text-[16px]">{profile.proudOf || <span className="meta">—</span>}</p>
        </div>
        <div className="card">
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

      {/* Glow-up */}
      {glow?.intake && (
        <section className="card mt-6">
          <div className="label mb-3">GitHub glow-up ✨ — intake vs now</div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <Glow label="Stars" from={glow.intake.totalStars} to={glow.latest?.totalStars ?? glow.intake.totalStars} />
            <Glow label="Followers" from={glow.intake.followers} to={glow.latest?.followers ?? glow.intake.followers} />
            <Glow label="Repos" from={glow.intake.publicRepos} to={glow.latest?.publicRepos ?? glow.intake.publicRepos} />
          </div>
        </section>
      )}

      {/* Shareable card */}
      {(isOwner || profile.graduate) && (
        <section className="card mt-6 bg-midnight-harbor text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[20px] font-extrabold">
                {profile.graduate ? "🎓 Graduated — share it" : "Share your profile"}
              </div>
              <div className="text-sea-fog text-[14px] mt-1">
                {author.name} · {stars} ⭐ · AI Foundations Summer School
              </div>
            </div>
            <CopyButton text={shareUrl} label="Copy share link" className="btn btn-primary btn-sm" />
          </div>
        </section>
      )}

      {/* Submissions */}
      <section className="mt-8">
        <h2 className="text-heading mb-4">Projects</h2>
        {submissions.length === 0 ? (
          <div className="card meta">No projects shipped yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {submissions.map((s) => (
              <SubmissionCard key={s.submission.id} item={s} />
            ))}
          </div>
        )}
      </section>

      {/* Comments — peers leaving a note on this profile */}
      <section className="mt-8 card !p-7">
        <CommentThread
          targetType="profile"
          targetId={profile.id}
          comments={comments}
          canComment={canComment}
          currentUser={currentUser}
          people={people}
        />
      </section>
    </div>
  );
}

function Glow({ label, from, to }: { label: string; from: number; to: number }) {
  const delta = to - from;
  return (
    <div>
      <div className="text-[28px] font-extrabold">{to}</div>
      <div className="meta">{label}</div>
      <div className={`text-[13px] font-semibold ${delta > 0 ? "text-active-teal" : "text-pale-steel"}`}>
        {delta >= 0 ? `+${delta}` : delta}
      </div>
    </div>
  );
}
