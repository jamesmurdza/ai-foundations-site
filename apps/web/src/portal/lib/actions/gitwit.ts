"use server";

import { requireOnboardedUser } from "@portal/lib/auth";
import {
  getCachedGitwitReview,
  upsertGitwitReview,
} from "@portal/lib/queries";
import { gatherProfileSignals } from "@portal/lib/github";
import { reviewProfile } from "@portal/lib/gitwit";
import {
  toReviewResult,
  type CriterionVerdict,
  type GitWitReviewResult,
} from "@portal/lib/gitwitTypes";
import { anthropicConfigured } from "@portal/lib/env";

/**
 * Run GitWit on the viewer's OWN GitHub profile (their login is already known —
 * no URL to paste, no prior submission required). Results are cached one-per-user
 * in `ss_gitwit_reviews`: a normal call returns the cached row if present, and
 * `{ refresh: true }` re-runs Haiku and overwrites it. This backs the automatic,
 * refreshable feedback step in the Week 1 flow.
 */
export async function reviewMyGitHubProfile(
  opts?: { refresh?: boolean },
): Promise<GitWitReviewResult> {
  const { user } = await requireOnboardedUser();

  const login = user.githubLogin;
  if (!login || String(user.githubId ?? "").startsWith("dev:")) {
    return {
      ok: false,
      error: "Connect your GitHub account so GitWit can review your profile.",
    };
  }

  if (!anthropicConfigured) {
    return { ok: false, error: "GitWit isn't available right now." };
  }

  // Serve the cached review unless an explicit refresh was requested.
  if (!opts?.refresh) {
    const cached = await getCachedGitwitReview(user.id);
    if (cached) {
      return toReviewResult(
        cached.login,
        cached.verdicts as CriterionVerdict[],
        cached.updatedAt.toISOString(),
      );
    }
  }

  try {
    const signals = await gatherProfileSignals(login, user.accessToken);
    const review = await reviewProfile(signals);
    const row = await upsertGitwitReview(user.id, login, review.verdicts);
    return toReviewResult(
      login,
      review.verdicts,
      (row?.updatedAt ?? new Date()).toISOString(),
    );
  } catch {
    return {
      ok: false,
      error: "GitWit couldn't finish the review — try again in a moment.",
    };
  }
}
