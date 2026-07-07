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

/**
 * Turn a review into a ready-to-paste prompt for an AI assistant: it names the
 * user's profile-README repo, lists exactly what to improve (with GitWit's
 * per-item suggestion), notes what's already covered so the model doesn't redo
 * it, and asks for concrete, paste-ready Markdown back. The "Copy suggestions"
 * button hands this to the clipboard.
 */
export function buildProfileSuggestionsPrompt(result: {
  login: string;
  good: VerdictWithLabel[];
  missing: VerdictWithLabel[];
}): string {
  const lines: string[] = [
    `I'm improving my GitHub profile README (https://github.com/${result.login}/${result.login}).`,
    "",
    "Here's what still needs work — help me fix each one:",
    ...result.missing.map(
      (m, i) => `${i + 1}. ${m.label}${m.note ? ` — ${m.note}` : ""}`,
    ),
  ];
  if (result.good.length) {
    lines.push(
      "",
      `Already covered (don't redo these): ${result.good
        .map((g) => g.label)
        .join(", ")}.`,
    );
  }
  lines.push(
    "",
    "For each item above, give me specific, concrete suggestions and copy-paste-ready Markdown I can drop straight into my README. Keep it authentic to me as a developer — no filler or clichés.",
  );
  return lines.join("\n");
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
