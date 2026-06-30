import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { submissions, reviewAssignments } from "@/db/schema";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Random peer-review matching (spec §4.5). Each submitter is assigned N other
 * submissions to review, chosen at random. Random — not reputation/pairing —
 * so it keeps working as the cohort drops out week to week. Idempotent: re-runs
 * top up missing assignments without duplicating.
 */
export async function assignReviews(
  assignmentId: string,
  n?: number,
): Promise<{ reviewers: number; assignments: number }> {
  const subs = await db
    .select({ id: submissions.id, userId: submissions.userId })
    .from(submissions)
    .where(eq(submissions.assignmentId, assignmentId));

  // One submission per reviewer (their latest) — they review *others*.
  const byUser = new Map<string, string>();
  for (const s of subs) byUser.set(s.userId, s.id);
  const reviewers = [...byUser.keys()];
  const reviewCount = n ?? 3;

  let created = 0;
  for (const reviewerId of reviewers) {
    const existing = await db
      .select({ submissionId: reviewAssignments.submissionId })
      .from(reviewAssignments)
      .where(
        and(
          eq(reviewAssignments.assignmentId, assignmentId),
          eq(reviewAssignments.reviewerId, reviewerId),
        ),
      );
    const have = new Set(existing.map((e) => e.submissionId));
    const need = Math.max(0, reviewCount - have.size);
    if (need === 0) continue;

    const candidates = shuffle(
      subs.filter((s) => s.userId !== reviewerId && !have.has(s.id)),
    ).slice(0, need);

    for (const c of candidates) {
      await db
        .insert(reviewAssignments)
        .values({ assignmentId, reviewerId, submissionId: c.id })
        .onConflictDoNothing();
      created++;
    }
  }

  return { reviewers: reviewers.length, assignments: created };
}
