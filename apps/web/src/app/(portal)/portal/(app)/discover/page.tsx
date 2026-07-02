import {
  getWeek,
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
import { SubmissionFeedPost } from "@portal/components/SubmissionFeedPost";
import { WorldMap } from "@portal/components/WorldMap";
import { StarBoard } from "@portal/components/StarBoard";
import { DiscoverShell, MapCollapseButton } from "@portal/components/DiscoverShell";
import { PinNavbar } from "@portal/components/PinNavbar";

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
  const sort = resolveSort(sp.sort);

  // The star board lives on its own hidden deep-link (?tab=stars).
  if (sp.tab === "stars") {
    return (
      <div className="py-2">
        <StarsTab />
      </div>
    );
  }

  // Discover is one page now: the map alongside the showcase timeline.
  const [mapPeople, feed] = await Promise.all([
    listProfilesForMap(),
    buildShowcaseFeed({ weekId: sp.week, sort }),
  ]);

  return (
    <div className="py-2">
      <PinNavbar />
      <DiscoverShell
        map={<WorldMap people={mapPeople} topControl={<MapCollapseButton />} />}
        feed={feed}
      />
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

// The showcase timeline — the feed of what the cohort shipped.
async function buildShowcaseFeed({
  weekId,
  sort,
}: {
  weekId?: string;
  sort: SortKey;
}) {
  const requested = weekId ? await getWeek(weekId) : null;
  const maxUnlocked = maxUnlockedWeek();
  const effectiveWeekId =
    requested && requested.isPublished && requested.number <= maxUnlocked
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
