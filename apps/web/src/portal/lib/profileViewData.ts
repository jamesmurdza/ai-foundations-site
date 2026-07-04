import "server-only";
import { getSessionContext } from "@portal/lib/auth";
import {
  listSubmissionsByUser,
  listStarredRepoKeys,
  isViewerFollowing,
} from "@portal/lib/queries";
import {
  isFollowing as githubIsFollowing,
  getRepoReadmeHtml,
} from "@portal/lib/github";
import { parseRepo, parseLogin } from "@portal/lib/github-parse";
import type { Profile } from "@portal/db/schema";
import type { Author } from "@portal/lib/queries";

/**
 * Gather everything the shared ProfileView needs (viewer context, projects,
 * follow state). Used by both the canonical /users/[login] page and the
 * /profiles/[id] fallback.
 *
 * Each project is enriched with its repo README (rendered as real GitHub
 * markdown) and the viewer's like state, so the profile can show full Discover-
 * style previews. README renders are cached per repo, so this is cheap.
 */
export async function loadProfileViewData(profile: Profile, author: Author) {
  const [{ user }, submissions] = await Promise.all([
    getSessionContext(),
    listSubmissionsByUser(profile.userId),
  ]);

  const isOwner = user?.id === profile.userId;

  const [likedRepos, readmeEntries] = await Promise.all([
    user ? listStarredRepoKeys(user.id) : Promise.resolve(new Set<string>()),
    Promise.all(
      submissions.map(async (it) => {
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

  const projects = submissions.map((item) => {
    const s = item.submission;
    const isRepo = Boolean(s.repoOwner && s.repoName);
    const repoKey = isRepo ? `${s.repoOwner}/${s.repoName}` : "";
    const liked = isRepo && likedRepos.has(repoKey);
    const canLike = hasToken && isRepo && s.userId !== user?.id;
    return { item, readmeHtml: readmeMap.get(s.id) ?? null, liked, canLike };
  });

  // GitHub is the source of truth for the button: a viewer who already follows
  // this person (here, on GitHub directly, or via the old auto-follow) sees
  // "Following" even if we have no local row. Fall back to our table if the
  // GitHub check is unavailable (rate-limited / errored).
  let isFollowing = false;
  if (user && !isOwner && author.login) {
    const gh = user.accessToken
      ? await githubIsFollowing(user.accessToken, author.login)
      : null;
    isFollowing = gh ?? (await isViewerFollowing(user.id, profile.userId));
  }

  return {
    profile,
    author,
    projects,
    isOwner,
    follow: {
      targetUserId: profile.userId,
      targetLogin: author.login,
      viewerSignedIn: Boolean(user),
      viewerConnected: Boolean(user?.accessToken),
      isFollowing,
    },
  };
}
