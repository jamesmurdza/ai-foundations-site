import { followProfile, unfollowProfile } from "@portal/lib/actions/follow";
import { SubmitButton } from "@portal/components/SubmitButton";
import { withBase } from "@portal/lib/paths";

/**
 * Manual GitHub follow button shown on a profile. Following here actually
 * follows the person on GitHub. States:
 *  - hidden  : own profile, or the target has no GitHub login to follow
 *  - sign-in : no viewer  → prompt to sign in
 *  - connect : viewer signed in but no GitHub connected → prompt to connect
 *  - follow / following : real toggle
 */
export function FollowButton({
  targetUserId,
  targetLogin,
  isOwner,
  viewerSignedIn,
  viewerConnected,
  isFollowing,
}: {
  targetUserId: string;
  targetLogin: string | null;
  isOwner: boolean;
  viewerSignedIn: boolean;
  viewerConnected: boolean;
  isFollowing: boolean;
}) {
  if (isOwner || !targetLogin) return null;

  if (!viewerSignedIn) {
    return (
      <a href={withBase("/login")} className="btn btn-outline btn-sm">
        Sign in to follow
      </a>
    );
  }

  if (!viewerConnected) {
    return (
      <a href={withBase("/api/auth/github")} className="btn btn-outline btn-sm">
        Connect GitHub to follow
      </a>
    );
  }

  const action = isFollowing ? unfollowProfile : followProfile;
  return (
    <form action={action}>
      <input type="hidden" name="targetUserId" value={targetUserId} />
      <input type="hidden" name="targetLogin" value={targetLogin} />
      {isFollowing ? (
        <SubmitButton className="btn btn-outline btn-sm" pendingText="…">
          Following ✓
        </SubmitButton>
      ) : (
        <SubmitButton className="btn btn-dark btn-sm" pendingText="…">
          Follow on GitHub
        </SubmitButton>
      )}
    </form>
  );
}
