import "server-only";
import { getSessionContext } from "@portal/lib/auth";
import {
  listSubmissionsByUser,
  starLeaderboardMap,
  isViewerFollowing,
} from "@portal/lib/queries";
import { isFollowing as githubIsFollowing } from "@portal/lib/github";
import type { Profile } from "@portal/db/schema";
import type { Author } from "@portal/lib/queries";

/**
 * Gather everything the shared ProfileView needs (viewer context, projects,
 * stars, follow state). Used by both the canonical /users/[login] page and the
 * /profiles/[id] fallback.
 */
export async function loadProfileViewData(profile: Profile, author: Author) {
  const [{ user }, submissions, starsMap] = await Promise.all([
    getSessionContext(),
    listSubmissionsByUser(profile.userId),
    starLeaderboardMap(),
  ]);

  const isOwner = user?.id === profile.userId;
  const stars = starsMap.get(profile.userId) ?? 0;

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
    submissions,
    stars,
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
