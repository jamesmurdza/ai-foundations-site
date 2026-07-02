import Link from "@portal/components/Link";
import {
  getWeek,
  listProfiles,
  listProfilesForMap,
  listShowcase,
  listStarredRepoKeys,
  starLeaderboard,
} from "@portal/lib/queries";
import { getRepoReadmeHtml } from "@portal/lib/github";
import { parseRepo, parseLogin } from "@portal/lib/github-parse";
import { getSessionContext } from "@portal/lib/auth";
import { maxUnlockedWeek } from "@portal/lib/weekRoutes";
import { rankByNeed } from "@portal/lib/compliments";
import { Avatar } from "@portal/components/Avatar";
import { SubmissionFeedPost } from "@portal/components/SubmissionFeedPost";
import { WorldMap } from "@portal/components/WorldMap";
import { StarBoard } from "@portal/components/StarBoard";
import { profileHref } from "@portal/lib/profileHref";

// "stars" is a real tab but hidden — reachable only via ?tab=stars, never shown
// as a pill.
type TabKey = "showcase" | "people" | "stars";

const TABS: { key: Exclude<TabKey, "stars">; label: string }[] = [
  { key: "showcase", label: "Showcase" },
  { key: "people", label: "Community" },
];

// People + Activity are now one "Community" tab. Every old deep link — the
// former Activity tab and the standalone map/pulse/profiles routes — funnels
// into it so existing links keep working.
const LEGACY_TABS: Record<string, TabKey> = {
  directory: "people",
  community: "people",
  activity: "people",
  map: "people",
  pulse: "people",
};

function resolveTab(raw?: string): TabKey {
  // Showcase is the front door to Discover — the feed of what the cohort shipped.
  if (!raw) return "showcase";
  if (raw === "stars") return "stars"; // hidden tab, deep-link only
  if (raw in LEGACY_TABS) return LEGACY_TABS[raw];
  return (TABS.find((t) => t.key === raw)?.key as TabKey) ?? "showcase";
}

// "needs" floats the least-commented work to the top — the whole matching idea.
// It's intentionally NOT a visible control (kept the top of the feed uncluttered);
// James's mid-week email just deep-links `?sort=needs`.
type SortKey = "newest" | "needs";

function resolveSort(raw?: string): SortKey {
  return raw === "needs" ? "needs" : "newest";
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; week?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const tab = resolveTab(sp.tab);
  const sort = resolveSort(sp.sort);

  return (
    <div className="py-2">
      {tab === "showcase" && <ShowcaseTab weekId={sp.week} sort={sort} />}
      {tab === "people" && <CommunityTab sort={sort} />}
      {tab === "stars" && <StarsTab />}
    </div>
  );
}

// The star board, on its own hidden tab (?tab=stars).
async function StarsTab() {
  const stars = await starLeaderboard();
  return (
    <div className="mx-auto max-w-[640px]">
      <section className="card">
        <h2 className="text-[22px] mb-1">Stars</h2>
        <p className="meta mb-6">
          The cohort crowdsources stars. Turn on Trade Stars and everyone who
          opted in auto-stars cohort GitHub repo posts.
        </p>
        <StarBoard total={stars.total} rows={stars.rows} />
      </section>
    </div>
  );
}

async function CommunityTab({ sort }: { sort: SortKey }) {
  // One tab for the whole cohort: the map (people as dots) and the directory.
  // The live pulse moved to the header popover; the star board to ?tab=stars.
  const [people, mapPeople] = await Promise.all([
    listProfiles(),
    listProfilesForMap(),
  ]);
  const ordered =
    sort === "needs"
      ? rankByNeed(people, (p) => ({
          count: p.complimentCount,
          createdAt: p.profile.createdAt,
        }))
      : people;

  return (
    // Break out of the page's narrow column to a wide, full-bleed canvas: the
    // map takes ~3/4 of the width on the left (pan/zoom, fills the page height)
    // and the cohort directory scrolls in a ~280px column on the right.
    <div className="relative left-1/2 flex w-[min(1280px,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-6 md:h-[calc(100vh-9rem)] md:flex-row">
      {/* The one map: the cohort as people-dots. */}
      <div className="h-[320px] min-w-0 md:h-full md:flex-1">
        <WorldMap people={mapPeople} />
      </div>

      {/* The directory — everyone in the cohort, in a scrolling column. */}
      <div className="shrink-0 md:h-full md:w-[280px] md:overflow-y-auto md:pr-1">
          <div className="mb-4">
            <h2 className="text-[22px] mb-1">The cohort</h2>
            <p className="meta">
              {people.length} {people.length === 1 ? "builder" : "builders"} so far —
              say hi, leave a compliment.
            </p>
          </div>
          {people.length === 0 ? (
            <p className="meta">No profiles yet.</p>
          ) : (
            <div className="space-y-2.5">
              {ordered.map(({ profile, author }) => (
                // prefetch={false}: the directory grows with the cohort; default
                // prefetch would fire one RSC request per card on scroll.
                <Link key={profile.id} href={profileHref(author)} prefetch={false} className="card block !p-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={author.avatarUrl} name={author.name} size={44} />
                    <div className="min-w-0">
                      <div className="font-semibold text-[14px] truncate flex items-center gap-2">
                        {author.name}
                        {profile.graduate && <span title="Graduate">🎓</span>}
                      </div>
                      <div className="meta-light text-[13px] truncate">
                        {[profile.city, profile.country].filter(Boolean).join(", ") || "—"}
                      </div>
                    </div>
                  </div>
                  {profile.wantToAchieve && (
                    <p className="meta text-[14px] mt-2 line-clamp-2">🎯 {profile.wantToAchieve}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

async function ShowcaseTab({ weekId, sort }: { weekId?: string; sort: SortKey }) {
  const requested = weekId ? await getWeek(weekId) : null;
  const maxUnlocked = maxUnlockedWeek();
  const effectiveWeekId =
    requested &&
    requested.isPublished &&
    requested.number <= maxUnlocked
      ? weekId
      : undefined;

  const items = (await listShowcase({ weekId: effectiveWeekId })).filter(
    (s) => s.weekNumber <= maxUnlocked,
  );
  const ordered =
    sort === "needs"
      ? rankByNeed(items, (it) => ({
          count: it.commentCount,
          createdAt: it.submission.createdAt,
        }))
      : items;

  const { user } = await getSessionContext();

  // Likes = GitHub stars the viewer already gave; readmeHtml = the repo's README
  // rendered as real GitHub-flavored markdown (cached per repo, so repeat renders
  // are cheap).
  const [likedRepos, readmeEntries] = await Promise.all([
    user ? listStarredRepoKeys(user.id) : Promise.resolve(new Set<string>()),
    Promise.all(
      ordered.map(async (it) => {
        const s = it.submission;
        let html: string | null = null;
        if (s.repoOwner && s.repoName) {
          html = await getRepoReadmeHtml(s.repoOwner, s.repoName);
        } else if (s.payloadType !== "text" && !parseRepo(s.payload)) {
          // A GitHub profile link (Week 1) — preview their profile README,
          // which lives in the {login}/{login} repo.
          const login = parseLogin(s.payload);
          if (login) html = await getRepoReadmeHtml(login, login);
        }
        return [s.id, html] as const;
      }),
    ),
  ]);
  const readmeMap = new Map(readmeEntries);
  const hasToken = Boolean(user?.accessToken);

  return items.length === 0 ? (
    <p className="meta">No submissions yet.</p>
  ) : (
    <div className="mx-auto max-w-[540px] space-y-14">
      {ordered.map((it) => {
        const s = it.submission;
        const isRepo = Boolean(s.repoOwner && s.repoName);
        const repoKey = isRepo ? `${s.repoOwner}/${s.repoName}` : "";
        const recordedLiked = isRepo && likedRepos.has(repoKey);
        const canLike = hasToken && isRepo && s.userId !== user?.id;
        return (
          <SubmissionFeedPost
            key={s.id}
            item={it}
            readmeHtml={readmeMap.get(s.id) ?? null}
            liked={recordedLiked}
            canLike={canLike}
          />
        );
      })}
    </div>
  );
}
