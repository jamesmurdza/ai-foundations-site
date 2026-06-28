import "server-only";
import { getSessionContext } from "@/lib/auth";
import {
  getGlowUp,
  listSubmissionsByUser,
  listComments,
  starLeaderboardMap,
  listMentionablePeople,
  isViewerFollowing,
} from "@/lib/queries";
import { isFollowing as githubIsFollowing } from "@/lib/github";
import { env } from "@/lib/env";
import type { Profile } from "@/db/schema";
import type { Author } from "@/lib/queries";

/**
 * Gather everything the shared ProfileView needs (viewer context, glow-up,
 * projects, comments, stars, follow state). Used by both the canonical
 * /users/[login] page and the /profiles/[id] fallback.
 */
export async function loadProfileViewData(profile: Profile, author: Author) {
  const [
    { user, profile: viewerProfile },
    glow,
    submissions,
    comments,
    starsMap,
    people,
  ] = await Promise.all([
    getSessionContext(),
    getGlowUp(profile.userId),
    listSubmissionsByUser(profile.userId),
    listComments("profile", profile.id),
    starLeaderboardMap(),
    listMentionablePeople(),
  ]);

  const isOwner = user?.id === profile.userId;
  const canComment = Boolean(user && viewerProfile);
  const currentUser: Author | null =
    user && viewerProfile
      ? {
          userId: user.id,
          name: viewerProfile.displayName ?? user.name ?? "You",
          login: user.githubLogin,
          avatarUrl: user.avatarUrl,
          profileId: viewerProfile.id,
          country: viewerProfile.country,
        }
      : null;

  const stars = starsMap.get(profile.userId) ?? 0;
  const shareUrl = author.login
    ? `${env.baseUrl}/users/${author.login}`
    : profile.username
      ? `${env.baseUrl}/u/${profile.username}`
      : `${env.baseUrl}/profiles/${profile.id}`;

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
    glow,
    submissions,
    comments,
    people,
    stars,
    isOwner,
    canComment,
    currentUser,
    shareUrl,
    follow: {
      targetUserId: profile.userId,
      targetLogin: author.login,
      viewerSignedIn: Boolean(user),
      viewerConnected: Boolean(user?.accessToken),
      isFollowing,
    },
  };
}
