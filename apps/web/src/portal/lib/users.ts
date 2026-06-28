import "server-only";
import { after } from "next/server";
import { revalidateTag } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@portal/db";
import { users, profiles, githubSnapshots } from "@portal/db/schema";
import { env } from "./env";
import { isAllowlistedAdmin } from "./admins";
import { findApplicationForUser } from "./applications";
import { getGithubStats, getGithubSocials } from "./github";
import { recordEvent } from "./events";
import { triggerTinysendSync } from "./background";
import type { GithubIdentity } from "./auth";
import type { User } from "@portal/db/schema";

async function captureIntakeSnapshot(
  userId: string,
  login: string,
  token?: string,
) {
  try {
    const existing = await db
      .select({ id: githubSnapshots.id })
      .from(githubSnapshots)
      .where(
        and(
          eq(githubSnapshots.userId, userId),
          eq(githubSnapshots.phase, "intake"),
        ),
      )
      .limit(1);
    if (existing.length) return;
    const stats = await getGithubStats(login, token);
    if (!stats) return;
    await db.insert(githubSnapshots).values({
      userId,
      phase: "intake",
      publicRepos: stats.publicRepos,
      followers: stats.followers,
      following: stats.following,
      totalStars: stats.totalStars,
    });
  } catch (e) {
    console.error("[users] intake snapshot failed", e);
  }
}

/**
 * Import the links a user already lists on their GitHub profile (website,
 * LinkedIn, X) into their portal profile — filling ONLY empty fields, so we
 * never clobber anything they've set. No-op until a profile exists. Public,
 * read-only data; idempotent.
 */
export async function backfillGithubSocials(
  userId: string,
  login: string,
  token?: string,
): Promise<void> {
  try {
    const [p] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    if (!p) return;
    const s = await getGithubSocials(login, token);
    const patch: Partial<typeof profiles.$inferInsert> = {};
    if (!p.githubUrl) patch.githubUrl = `https://github.com/${login}`;
    if (!p.linkedinUrl && s.linkedin) patch.linkedinUrl = s.linkedin;
    if (!p.xUrl && s.twitter) patch.xUrl = s.twitter;
    if (!p.siteUrl && !p.portfolioUrl && s.website) patch.siteUrl = s.website;
    if (Object.keys(patch).length) {
      await db
        .update(profiles)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(profiles.userId, userId));
      revalidateTag("profiles", { expire: 0 });
    }
  } catch (e) {
    console.error("[users] social backfill failed", e);
  }
}

export async function upsertUserFromGithub(
  identity: GithubIdentity,
  accessToken: string,
  scope: string,
): Promise<{ user: User; isNew: boolean }> {
  const githubId = String(identity.id);
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.githubId, githubId))
    .limit(1);

  const admin = await isAllowlistedAdmin(identity.email, identity.login);

  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        githubLogin: identity.login,
        name: identity.name ?? existing.name,
        email: identity.email ?? existing.email,
        avatarUrl: identity.avatarUrl,
        accessToken,
        tokenScopes: scope,
        isAdmin: admin,
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();
    void captureIntakeSnapshot(updated.id, identity.login, accessToken);
    return { user: updated, isNew: false };
  }

  const application = await findApplicationForUser({
    email: identity.email,
    githubLogin: identity.login,
  });
  const [created] = await db
    .insert(users)
    .values({
      githubId,
      githubLogin: identity.login,
      name: identity.name,
      email: identity.email,
      avatarUrl: identity.avatarUrl,
      accessToken,
      tokenScopes: scope,
      isAdmin: admin,
      applicationId: application?.id ?? null,
      lastLoginAt: new Date(),
    })
    .returning();

  await captureIntakeSnapshot(created.id, identity.login, accessToken);
  await recordEvent({
    type: "joined",
    actorId: created.id,
    actorName: identity.name ?? identity.login,
    summary: `${identity.name ?? identity.login} joined the cohort`,
  });
  // Instant tinysend sync (cron is the backstop). Fire-and-forget after response.
  if (created.email) after(() => triggerTinysendSync());

  return { user: created, isNew: true };
}

/** Link a GitHub identity to an already-signed-in user (the connect step). */
export async function linkGithubToUser(
  userId: string,
  identity: GithubIdentity,
  accessToken: string,
  scope: string,
): Promise<{ ok: boolean; error?: string }> {
  const githubId = String(identity.id);
  const [conflict] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.githubId, githubId))
    .limit(1);
  if (conflict && conflict.id !== userId) return { ok: false, error: "linked_elsewhere" };

  const [me] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!me) return { ok: false, error: "no_user" };

  await db
    .update(users)
    .set({
      githubId,
      githubLogin: identity.login,
      avatarUrl: identity.avatarUrl,
      name: me.name ?? identity.name,
      email: me.email ?? identity.email,
      accessToken,
      tokenScopes: scope,
      isAdmin: await isAllowlistedAdmin(me.email ?? identity.email, identity.login),
    })
    .where(eq(users.id, userId));

  void captureIntakeSnapshot(userId, identity.login, accessToken);
  void backfillGithubSocials(userId, identity.login, accessToken);
  // Connecting GitHub fills the directory's avatar/login join synchronously here
  // (backfillGithubSocials is fire-and-forget, so don't rely on its tag).
  revalidateTag("profiles", { expire: 0 });
  return { ok: true };
}

/** Create or fetch a user from a verified email (the OTP login path). */
export async function upsertUserByEmail(
  email: string,
): Promise<{ user: User; isNew: boolean }> {
  const clean = email.trim().toLowerCase();
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, clean))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        isAdmin: await isAllowlistedAdmin(clean, existing.githubLogin),
      })
      .where(eq(users.id, existing.id))
      .returning();
    return { user: updated, isNew: false };
  }

  const application = await findApplicationForUser({ email: clean });
  const name = application?.name ?? clean.split("@")[0];
  const [created] = await db
    .insert(users)
    .values({
      email: clean,
      name,
      isAdmin: await isAllowlistedAdmin(clean),
      applicationId: application?.id ?? null,
      lastLoginAt: new Date(),
    })
    .returning();

  await recordEvent({
    type: "joined",
    actorId: created.id,
    actorName: name,
    summary: `${name} joined the cohort`,
  });
  if (created.email) after(() => triggerTinysendSync());
  return { user: created, isNew: true };
}

export async function upsertDevUser(
  email: string,
  name: string,
): Promise<{ user: User; isNew: boolean }> {
  if (!env.devLoginEnabled) throw new Error("dev login disabled");
  const clean = email.trim().toLowerCase();
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, clean))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(users)
      .set({ lastLoginAt: new Date(), isAdmin: await isAllowlistedAdmin(clean) })
      .where(eq(users.id, existing.id))
      .returning();
    return { user: updated, isNew: false };
  }

  const application = await findApplicationForUser({ email: clean });
  const login = clean.split("@")[0];
  const [created] = await db
    .insert(users)
    .values({
      githubId: `dev:${clean}`,
      githubLogin: login,
      name,
      email: clean,
      avatarUrl: null,
      isDev: true,
      isAdmin: await isAllowlistedAdmin(clean),
      applicationId: application?.id ?? null,
      lastLoginAt: new Date(),
    })
    .returning();

  await recordEvent({
    type: "joined",
    actorId: created.id,
    actorName: name,
    summary: `${name} joined the cohort`,
  });

  return { user: created, isNew: true };
}
