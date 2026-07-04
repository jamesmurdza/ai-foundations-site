"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@portal/db";
import {
  checkins,
  weekStepCompletions,
  streamReactions,
  qaQuestions,
  qaUpvotes,
  streamPresence,
} from "@portal/db/schema";
import { requireOnboardedUser } from "@portal/lib/auth";
import { recordEvent } from "@portal/lib/events";

export async function checkIn(formData: FormData) {
  const { user, profile } = await requireOnboardedUser();
  const weekId = String(formData.get("weekId") ?? "") || null;
  const today = new Date().toISOString().slice(0, 10);

  const res = await db
    .insert(checkins)
    .values({ userId: user.id, weekId, day: today })
    .onConflictDoNothing()
    .returning();

  if (res.length) {
    await recordEvent({
      type: "checkin",
      actorId: user.id,
      actorName: profile.displayName ?? user.name ?? "Someone",
      summary: `${profile.displayName ?? user.name} checked in`,
      weekId,
    });
  }
  revalidatePath("/lessons");
}

export async function toggleWeekStep(
  weekId: string,
  stepKey: string,
  completed: boolean,
) {
  const { user } = await requireOnboardedUser();
  const wid = weekId.trim();
  const key = stepKey.trim().slice(0, 120);
  if (!wid || !key) return;

  await db
    .insert(weekStepCompletions)
    .values({
      userId: user.id,
      weekId: wid,
      stepKey: key,
      completed,
    })
    .onConflictDoUpdate({
      target: [
        weekStepCompletions.userId,
        weekStepCompletions.weekId,
        weekStepCompletions.stepKey,
      ],
      set: { completed, updatedAt: new Date() },
    });

  // No revalidation: the checklist / week-steps are client-optimistic, so the
  // round-trip per toggle is pure cost. Other views pick up the new state on
  // their next navigation.
}

export async function addReaction(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const weekId = String(formData.get("weekId") ?? "");
  const emoji = String(formData.get("emoji") ?? "👏").slice(0, 8);
  if (!weekId) return;
  await db.insert(streamReactions).values({ weekId, userId: user.id, emoji });
  revalidatePath(`/weeks/${weekId}`);
}

export async function askQuestion(formData: FormData) {
  const { user, profile } = await requireOnboardedUser();
  const weekId = String(formData.get("weekId") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, 500);
  if (!weekId || !body) return;
  // You're posting it, so it's auto-upvoted once (by you): start at 1 and record
  // your vote so you can't upvote your own question again.
  const [q] = await db
    .insert(qaQuestions)
    .values({
      weekId,
      userId: user.id,
      userName: profile.displayName ?? user.name ?? user.githubLogin,
      body,
      upvotes: 1,
    })
    .returning({ id: qaQuestions.id });
  await db
    .insert(qaUpvotes)
    .values({ questionId: q.id, userId: user.id })
    .onConflictDoNothing();
  revalidatePath(`/weeks/${weekId}`);
  revalidatePath("/lessons");
}

export async function upvoteQuestion(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const questionId = String(formData.get("questionId") ?? "");
  const weekId = String(formData.get("weekId") ?? "");
  if (!questionId) return;
  const inserted = await db
    .insert(qaUpvotes)
    .values({ questionId, userId: user.id })
    .onConflictDoNothing()
    .returning();
  if (inserted.length) {
    await db
      .update(qaQuestions)
      .set({ upvotes: sql`${qaQuestions.upvotes} + 1` })
      .where(eq(qaQuestions.id, questionId));
  }
  if (weekId) revalidatePath(`/weeks/${weekId}`);
}

export async function heartbeatPresence(weekId: string) {
  const { user, profile } = await requireOnboardedUser();
  if (!weekId) return;
  await db
    .insert(streamPresence)
    .values({
      weekId,
      userId: user.id,
      userName: profile.displayName ?? user.name ?? user.githubLogin,
      lastSeenAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [streamPresence.weekId, streamPresence.userId],
      set: { lastSeenAt: new Date() },
    });
}
