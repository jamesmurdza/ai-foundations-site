import "server-only";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "@portal/db";
import {
  streamPresence,
  streamReactions,
  qaQuestions,
  qaUpvotes,
} from "@portal/db/schema";

export async function activeViewers(weekId: string): Promise<number> {
  const cutoff = new Date(Date.now() - 90_000);
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(streamPresence)
    .where(and(eq(streamPresence.weekId, weekId), gt(streamPresence.lastSeenAt, cutoff)));
  return r?.n ?? 0;
}

export async function reactionCounts(
  weekId: string,
): Promise<{ emoji: string; n: number }[]> {
  const rows = await db
    .select({ emoji: streamReactions.emoji, n: sql<number>`count(*)::int` })
    .from(streamReactions)
    .where(eq(streamReactions.weekId, weekId))
    .groupBy(streamReactions.emoji);
  return rows.sort((a, b) => b.n - a.n);
}

export async function listQuestions(weekId: string) {
  return db
    .select()
    .from(qaQuestions)
    .where(eq(qaQuestions.weekId, weekId))
    .orderBy(qaQuestions.answered, desc(qaQuestions.upvotes), desc(qaQuestions.createdAt));
}

/** Question IDs in this week the given user has already upvoted. */
export async function listUpvotedQuestionIds(
  weekId: string,
  userId: string,
): Promise<string[]> {
  const rows = await db
    .select({ qid: qaUpvotes.questionId })
    .from(qaUpvotes)
    .innerJoin(qaQuestions, eq(qaQuestions.id, qaUpvotes.questionId))
    .where(and(eq(qaQuestions.weekId, weekId), eq(qaUpvotes.userId, userId)));
  return rows.map((r) => r.qid);
}
