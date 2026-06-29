import Link from "next/link";
import { Radio } from "lucide-react";
import {
  getWeek,
  listProfiles,
  listProfilesForMap,
  listShowcase,
  listTopCommentsForSubmissions,
  listStarredRepoKeys,
  listMentionablePeople,
  starLeaderboard,
  type Author,
} from "@/lib/queries";
import { getRepoReadmeGist } from "@/lib/github";
import { parseRepo, parseLogin } from "@/lib/github-parse";
import { getSessionContext } from "@/lib/auth";
import { maxUnlockedWeek } from "@/lib/weekRoutes";
import { rankByNeed } from "@/lib/compliments";
import { listEvents } from "@/lib/events";
import { Avatar } from "@/components/Avatar";
import { SubmissionFeedPost } from "@/components/SubmissionFeedPost";
import { WorldMap } from "@/components/WorldMap";
import { StarBoard } from "@/components/StarBoard";
import { PulseFeed } from "@/components/PulseFeed";
import { Popover } from "@/components/Popover";
import { profileHref } from "@/lib/profileHref";

const TABS = [
  { key: "showcase", label: "Showcase" },
  { key: "people", label: "Community" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// People + Activity are now one "Community" tab. Every old deep link — the
// former Activity tab and the standalone map/stars/pulse/profiles routes — funnels
// into it so existing links keep working.
const LEGACY_TABS: Record<string, TabKey> = {
  directory: "people",
  community: "people",
  activity: "people",
  map: "people",
  stars: "people",
  pulse: "people",
};

function resolveTab(raw?: string): TabKey {
  // Showcase is the front door to Discover — the feed of what the cohort shipped.
  if (!raw) return "showcase";
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
  // The live pulse is a cohort-wide view, so it lives in a header popover (like
  // the Q&A popover in lessons) rather than inside any one tab.
  const events = await listEvents(150);

  return (
    <div className="py-2">
      <div className="relative mb-6">
        <div className="absolute right-0 top-0">
          <Popover icon={<Radio size={19} aria-hidden />} label="Live" width={380}>
            <div className="mb-3 flex items-center gap-2">
              <span className="badge badge-teal"><span className="live-dot" /> live</span>
              <span className="meta text-[13px]">
                Everything happening across the cohort, in real time.
              </span>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <PulseFeed events={events} />
            </div>
          </Popover>
        </div>
        <div className="mx-auto max-w-[880px] text-center">
          <h1 className="text-[34px] mb-1">Discover</h1>
          <p className="meta mb-4 mx-auto max-w-[60ch]">
            The cohort — who&apos;s here, what they&apos;ve shipped, and what&apos;s
            happening right now.
          </p>

          <div className="flex justify-center flex-wrap gap-2">
            {TABS.map((t) => (
              <Link
                key={t.key}
                href={`/discover?tab=${t.key}`}
                className={`pill ${tab === t.key ? "bg-signal-blue text-white" : "bg-ice-tint text-slate-channel"}`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {tab === "showcase" && <ShowcaseTab weekId={sp.week} sort={sort} />}
      {tab === "people" && <CommunityTab sort={sort} />}
    </div>
  );
}

async function CommunityTab({ sort }: { sort: SortKey }) {
  // One tab for the whole cohort: the map (people as dots), the star board, and
  // the directory. The live pulse moved to the header popover.
  const [people, mapPeople, stars] = await Promise.all([
    listProfiles(),
    listProfilesForMap(),
    starLeaderboard(),
  ]);
  const withoutLocation = people.length - mapPeople.length;
  const countries = new Set(mapPeople.map((p) => p.countryDisplay)).size;
  const ordered =
    sort === "needs"
      ? rankByNeed(people, (p) => ({
          count: p.complimentCount,
          createdAt: p.profile.createdAt,
        }))
      : people;

  return (
    <div className="space-y-8">
      {/* The one map: the cohort as people-dots. */}
      <section className="card">
        <h2 className="text-[22px] mb-1">Where we are</h2>
        <p className="meta mb-4">
          {mapPeople.length} builder{mapPeople.length === 1 ? "" : "s"} across{" "}
          {countries} countr{countries === 1 ? "y" : "ies"}
          {withoutLocation > 0
            ? ` — ${withoutLocation} haven’t added a country yet`
            : " — one global cohort."}
        </p>
        <WorldMap people={mapPeople} withoutLocation={withoutLocation} />
      </section>

      {/* The directory — everyone in the cohort, right under the map. */}
      <section>
        <div className="flex items-end justify-between flex-wrap gap-2 mb-4">
          <div>
            <h2 className="text-[22px] mb-1">The cohort</h2>
            <p className="meta">
              {people.length} {people.length === 1 ? "builder" : "builders"} so far —
              say hi, leave a compliment.
            </p>
          </div>
        </div>
        {people.length === 0 ? (
          <div className="card meta">No profiles yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ordered.map(({ profile, author, starsReceived, complimentCount }) => (
              // prefetch={false}: the directory grows with the cohort; default
              // prefetch would fire one RSC request per card on scroll.
              <Link key={profile.id} href={profileHref(author)} prefetch={false} className="card card-hover">
                <div className="flex items-center gap-3">
                  <Avatar src={author.avatarUrl} name={author.name} size={48} />
                  <div className="min-w-0">
                    <div className="font-bold truncate flex items-center gap-2">
                      {author.name}
                      {profile.graduate && <span title="Graduate">🎓</span>}
                    </div>
                    <div className="meta-light text-[13px] truncate">
                      {[profile.city, profile.country].filter(Boolean).join(", ") || "—"}
                    </div>
                  </div>
                </div>
                {profile.wantToAchieve && (
                  <p className="meta text-[14px] mt-3 line-clamp-2">🎯 {profile.wantToAchieve}</p>
                )}
                <div className="hairline pt-3 mt-3 flex items-center justify-between meta-light text-[13px]">
                  <span>
                    {complimentCount === 0
                      ? "Be the first to compliment 💛"
                      : `💬 ${complimentCount} · ${starsReceived} ⭐`}
                  </span>
                  {profile.achieved && <span className="badge badge-teal">goal hit ✓</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* The star board. */}
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

  const ids = ordered.map((i) => i.submission.id);
  const [commentMap, people, { user, profile }] = await Promise.all([
    listTopCommentsForSubmissions(ids, 2),
    listMentionablePeople(),
    getSessionContext(),
  ]);
  const canComment = Boolean(user && profile);
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

  // Likes = GitHub stars the viewer already gave; gists = a README preview per
  // repo post (cached per repo, so repeat renders are cheap).
  const [likedRepos, gistEntries] = await Promise.all([
    user ? listStarredRepoKeys(user.id) : Promise.resolve(new Set<string>()),
    Promise.all(
      ordered.map(async (it) => {
        const s = it.submission;
        let gist: string | null = null;
        if (s.repoOwner && s.repoName) {
          gist = await getRepoReadmeGist(s.repoOwner, s.repoName);
        } else if (s.payloadType !== "text" && !parseRepo(s.payload)) {
          // A GitHub profile link (Week 1) — preview their profile README,
          // which lives in the {login}/{login} repo.
          const login = parseLogin(s.payload);
          if (login) gist = await getRepoReadmeGist(login, login);
        }
        return [s.id, gist] as const;
      }),
    ),
  ]);
  const gistMap = new Map(gistEntries);
  const hasToken = Boolean(user?.accessToken);

  return items.length === 0 ? (
    <div className="card meta">No submissions here yet.</div>
  ) : (
    <div className="mx-auto max-w-[600px] space-y-6">
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
            gist={gistMap.get(s.id) ?? null}
            liked={recordedLiked}
            canLike={canLike}
            comments={commentMap.get(s.id) ?? []}
            canComment={canComment}
            currentUser={currentUser}
            people={people}
          />
        );
      })}
    </div>
  );
}
