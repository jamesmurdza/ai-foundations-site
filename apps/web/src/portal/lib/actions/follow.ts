"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@portal/db";
import { follows } from "@portal/db/schema";
import { requireOnboardedUser } from "@portal/lib/auth";
import { followUser, unfollowUser } from "@portal/lib/github";
import { recordEvent } from "@portal/lib/events";

/**
 * Manually follow another participant — for real, on GitHub. There is no
 * auto-follow anywhere; this button is the only path. Needs the viewer's GitHub
 * connected (access token). Records the follow in ss_follows so the button can
 * show Follow vs Following and support unfollow.
 */
export async function followProfile(formData: FormData) {
  const { user, profile } = await requireOnboardedUser();
  const targetUserId = String(formData.get("targetUserId") ?? "");
  const targetLogin = String(formData.get("targetLogin") ?? "");
  if (!user.accessToken || !targetUserId || !targetLogin) return;
  if (targetUserId === user.id) return; // can't follow yourself

  const res = await followUser(user.accessToken, targetLogin);

  await db
    .insert(follows)
    .values({
      fromUserId: user.id,
      toUserId: targetUserId,
      toLogin: targetLogin,
      active: res.ok,
    })
    .onConflictDoUpdate({
      target: [follows.fromUserId, follows.toUserId],
      set: { active: res.ok, toLogin: targetLogin, updatedAt: new Date() },
    });

  if (res.ok) {
    const who = profile.displayName ?? user.name ?? user.githubLogin ?? "Someone";
    await recordEvent({
      type: "follow",
      actorId: user.id,
      actorName: who,
      summary: `${who} followed @${targetLogin} on GitHub`,
      targetType: "profile",
      targetId: targetUserId,
    });
  }

  revalidatePath(`/users/${targetLogin}`);
}

export async function unfollowProfile(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const targetUserId = String(formData.get("targetUserId") ?? "");
  const targetLogin = String(formData.get("targetLogin") ?? "");
  if (!user.accessToken || !targetUserId || !targetLogin) return;

  const res = await unfollowUser(user.accessToken, targetLogin);
  if (res.ok) {
    await db
      .update(follows)
      .set({ active: false, updatedAt: new Date() })
      .where(
        and(
          eq(follows.fromUserId, user.id),
          eq(follows.toUserId, targetUserId),
        ),
      );
  }

  revalidatePath(`/users/${targetLogin}`);
}
