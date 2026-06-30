"use server";

import { requireOnboardedUser } from "@portal/lib/auth";
import { getUserSubmissionForAssignment } from "@portal/lib/queries";
import { gatherProfileSignals } from "@portal/lib/github";
import { validateProfileSubmission } from "@portal/lib/github-parse";
import { reviewProfile } from "@portal/lib/gitwit";
import { partitionReview, type GitWitReviewResult } from "@portal/lib/gitwitTypes";
import { anthropicConfigured } from "@portal/lib/env";

/**
 * Run GitWit on the viewer's latest submission for an assignment. Reads the
 * submitted GitHub profile URL, gathers profile + README signals, and returns a
 * derived good/missing split for the UI. Read-only — no DB writes, no redirect.
 */
export async function reviewMyGitHubProfile(
  assignmentId: string,
): Promise<GitWitReviewResult> {
  const { user } = await requireOnboardedUser();

  if (!anthropicConfigured) {
    return { ok: false, error: "GitWit isn't available right now." };
  }

  const submission = await getUserSubmissionForAssignment(assignmentId, user.id);
  if (!submission) {
    return { ok: false, error: "Submit your GitHub profile first, then ask GitWit." };
  }

  // Strict: students must submit their OWN GitHub profile / README link — a
  // wrong link gets a GitWit-voiced correction instead of a bogus review.
  // Admins/organizers may review ANY profile (for checking participants).
  const check = validateProfileSubmission(submission.payload, user.githubLogin, {
    allowAnyOwner: user.isAdmin,
  });
  if (!check.ok) {
    return { ok: false, error: check.message };
  }
  const login = check.login;

  try {
    const signals = await gatherProfileSignals(login, user.accessToken);
    const review = await reviewProfile(signals);
    const { good, missing, allGood } = partitionReview(review);
    return { ok: true, login, allGood, good, missing };
  } catch {
    return {
      ok: false,
      error: "GitWit couldn't finish the review — try again in a moment.",
    };
  }
}
