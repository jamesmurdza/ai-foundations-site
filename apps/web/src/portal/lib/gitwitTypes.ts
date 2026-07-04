/**
 * Client-safe types + the pure `partitionReview` derivation for GitWit. Kept
 * separate from `gitwit.ts` (which is `server-only` and pulls in the Anthropic
 * SDK) so the React UI and the server action can share these without bundling
 * the SDK into the client.
 */
import { gitwitCriterion, type GitWitCriterionId } from "./gitwitCriteria";

/** Everything gathered from GitHub that GitWit needs to judge a profile. */
export type ProfileSignals = {
  login: string;
  name: string | null;
  bio: string | null;
  /** Public avatar URL — passed to the model as an image for the picture check. */
  avatarUrl: string | null;
  website: string | null;
  linkedin: string | null;
  twitter: string | null;
  pinnedRepos: { name: string; description: string | null }[];
  readmeMarkdown: string | null;
};

export type CriterionVerdict = {
  id: GitWitCriterionId;
  met: boolean;
  /** Evidence when met; a short, concrete suggestion when not. One sentence. */
  note: string;
};

export type GitWitReview = {
  /** Exactly one verdict per criterion, in canonical order. */
  verdicts: CriterionVerdict[];
};

export type VerdictWithLabel = CriterionVerdict & { label: string };

/**
 * Derive the two lists the UI shows. "good" = met, "missing" = not met. When
 * `missing` is empty the profile passed clean — the UI celebrates instead of
 * inventing work.
 */
export function partitionReview(review: GitWitReview): {
  good: VerdictWithLabel[];
  missing: VerdictWithLabel[];
  allGood: boolean;
} {
  const withLabel = review.verdicts.map((v) => ({
    ...v,
    label: gitwitCriterion(v.id).label,
  }));
  const good = withLabel.filter((v) => v.met);
  const missing = withLabel.filter((v) => !v.met);
  return { good, missing, allGood: missing.length === 0 };
}

/** What the GitWit server action hands back to the client. */
export type GitWitReviewResult =
  | {
      ok: true;
      login: string;
      allGood: boolean;
      good: VerdictWithLabel[];
      missing: VerdictWithLabel[];
      /** ISO timestamp of when this review was produced (for "last checked"). */
      checkedAt: string;
    }
  | { ok: false; error: string };

/** Build the client-facing result from raw verdicts + when they were produced. */
export function toReviewResult(
  login: string,
  verdicts: CriterionVerdict[],
  checkedAt: string,
): GitWitReviewResult {
  const { good, missing, allGood } = partitionReview({ verdicts });
  return { ok: true, login, allGood, good, missing, checkedAt };
}
