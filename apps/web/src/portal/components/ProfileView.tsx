import type { ReactNode } from "react";
import { MapPin, Link2 } from "lucide-react";
import Link from "@portal/components/Link";
import { SubmissionCard } from "@portal/components/SubmissionCard";
import { FollowButton } from "@portal/components/FollowButton";
import { Avatar } from "@portal/components/Avatar";
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
 * Shared profile renderer, laid out like a GitHub profile: a sticky identity
 * rail on the left (avatar, name, follow/edit, bio, location + links) and a
 * main content column on the right (the GitHub README as `readme` centerpiece
 * and the person's projects as a "pinned"-style card grid). Used by the
 * canonical /users/[githubusername] page and the /profiles/[id] fallback (which
 * passes no readme).
 */
export function ProfileView({
  profile,
  author,
  submissions,
  isOwner,
  follow,
  readme,
}: {
  profile: Profile;
  author: Author;
  submissions: ShowcaseItem[];
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
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  return (
    <div className="container-page py-10 max-w-[1120px]">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        {/* Identity rail */}
        <aside className="lg:sticky lg:top-6">
          <Avatar src={author.avatarUrl} name={author.name} size={128} />
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <h1 className="text-heading-lg">{author.name}</h1>
            {profile.graduate && <span className="badge badge-teal">🎓 Graduate</span>}
          </div>
          {profile.username && (
            <div className="text-slate-channel text-[16px] mt-0.5">@{profile.username}</div>
          )}

          {/* Full-width follow / edit, GitHub-style. */}
          <div className="mt-4 [&_a]:w-full [&_a]:justify-center [&_button]:w-full [&_button]:justify-center [&_form]:w-full">
            {isOwner ? (
              <Link href="/profile/edit" className="btn btn-outline btn-sm">Edit profile</Link>
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

          {profile.bio && <p className="mt-4 text-[15px]">{profile.bio}</p>}

          {(location || links.some(([, href]) => href)) && (
            <div className="mt-4 space-y-2 text-[14px]">
              {location && (
                <div className="flex items-center gap-2 text-slate-channel">
                  <MapPin size={16} className="shrink-0 text-pale-steel" />
                  <span className="truncate">{location}</span>
                </div>
              )}
              {links.map(([label, href]) =>
                href ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-slate-channel hover:text-signal-blue"
                  >
                    <Link2 size={16} className="shrink-0 text-pale-steel" />
                    <span className="truncate">{label}</span>
                  </a>
                ) : null,
              )}
            </div>
          )}
        </aside>

        {/* Main content */}
        <div className="min-w-0">
          {/* GitHub README — the centerpiece (mirrors their GitHub profile) */}
          {readme}

          {/* Proud of / Excited by — private to the owner, never shown publicly. */}
          {isOwner && (
            <section className={readme ? "mt-8" : ""}>
              <div className="meta-light text-[12px] mb-3">Private — only visible to you</div>
              <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                <div>
                  <div className="label">🏅 Proud of</div>
                  <p className="mt-1 text-[15px]">
                    {profile.proudOf || <span className="meta">—</span>}
                  </p>
                </div>
                <div>
                  <div className="label">🎯 Excited by</div>
                  <p className="mt-1 text-[15px]">
                    {profile.wantToAchieve || <span className="meta">—</span>}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Projects — a "pinned"-style card grid, matching Discover / My Work. */}
          <section className={readme || isOwner ? "mt-10" : ""}>
            <h2 className="text-heading mb-4">Projects</h2>
            {submissions.length === 0 ? (
              <p className="meta">No projects shipped yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {submissions.map((s) => (
                  <SubmissionCard key={s.submission.id} item={s} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
