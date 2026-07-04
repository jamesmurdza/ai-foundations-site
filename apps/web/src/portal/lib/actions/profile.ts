"use server";

import { redirect } from "@portal/lib/nav";
import { revalidatePath, revalidateTag } from "next/cache";
import { after } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@portal/db";
import { profiles, users } from "@portal/db/schema";
import { requireUser, getSessionContext, requireOnboardedUser } from "@portal/lib/auth";
import { autoStarActive } from "@portal/lib/startrade";
import { triggerStarTrade } from "@portal/lib/background";
import { canEnableTradeStars } from "@portal/lib/tradeStars";
import { recordEvent } from "@portal/lib/events";
import { backfillGithubSocials } from "@portal/lib/users";
import { slugifyUsername, ensureUniqueUsername } from "@portal/lib/username";
import { normalizeCountry, displayCountry } from "@portal/lib/countries";

function normalizeProfileCountry(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const key = normalizeCountry(trimmed);
  return key ? displayCountry(key) : trimmed;
}

const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Add your name").max(80),
  proudOf: z.string().trim().max(500).optional().default(""),
  wantToAchieve: z.string().trim().max(500).optional().default(""),
  bio: z.string().trim().max(400).optional().default(""),
  country: z.string().trim().max(80).optional().default(""),
  city: z.string().trim().max(80).optional().default(""),
  githubUrl: z.string().trim().max(200).optional().default(""),
  linkedinUrl: z.string().trim().max(200).optional().default(""),
  xUrl: z.string().trim().max(200).optional().default(""),
  siteUrl: z.string().trim().max(200).optional().default(""),
  publicEmail: z.string().trim().max(200).optional().default(""),
});

/**
 * Resolve a desired @username for a user on save. Returns the slug to store, or
 * null to leave it unchanged. Throws "username_taken" if another user owns it.
 */
async function resolveUsername(
  userId: string,
  raw: string,
  current: string | null,
): Promise<string | null> {
  const desired = slugifyUsername(raw);
  if (!desired || desired === current) return null;
  const [clash] = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(and(eq(profiles.username, desired), ne(profiles.userId, userId)))
    .limit(1);
  if (clash) throw new Error("username_taken");
  return desired;
}

function parse(formData: FormData) {
  return profileSchema.parse({
    displayName: formData.get("displayName") ?? "",
    proudOf: formData.get("proudOf") ?? "",
    wantToAchieve: formData.get("wantToAchieve") ?? "",
    bio: formData.get("bio") ?? "",
    country: formData.get("country") ?? "",
    city: formData.get("city") ?? "",
    githubUrl: formData.get("githubUrl") ?? "",
    linkedinUrl: formData.get("linkedinUrl") ?? "",
    xUrl: formData.get("xUrl") ?? "",
    siteUrl: formData.get("siteUrl") ?? "",
    publicEmail: formData.get("publicEmail") ?? "",
  });
}

export async function updateProfile(formData: FormData) {
  const { user, profile } = await getSessionContext();
  if (!user || !profile) redirect("/login");
  const data = parse(formData);

  let username: string | null = null;
  try {
    username = await resolveUsername(
      user.id,
      String(formData.get("username") ?? ""),
      profile.username,
    );
  } catch {
    redirect("/settings/profile?error=username_taken");
  }

  await db
    .update(profiles)
    .set({
      ...data,
      country: normalizeProfileCountry(data.country),
      ...(username ? { username } : {}),
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, user.id));

  const dest = user.githubLogin
    ? `/users/${user.githubLogin}`
    : `/profiles/${profile.id}`;
  // Name/location/socials are denormalized into the directory + showcase author.
  revalidateTag("profiles", { expire: 0 });
  revalidateTag("showcase", { expire: 0 });
  revalidatePath("/home");
  revalidatePath("/profiles");
  revalidatePath(dest);
  redirect("/settings/profile?saved=1");
}

/* ---- Multi-step onboarding ---------------------------------------------- */
async function upsertProfile(userId: string, fields: Record<string, unknown>) {
  const existing = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  if (existing.length) {
    await db
      .update(profiles)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(profiles.userId, userId));
  } else {
    // First creation: mint a shareable @username from their GitHub/display name.
    const [u] = await db
      .select({ githubLogin: users.githubLogin, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const seed =
      u?.githubLogin ||
      (fields.displayName as string) ||
      u?.name ||
      u?.email?.split("@")[0] ||
      "user";
    const username = await ensureUniqueUsername(seed);
    await db.insert(profiles).values({ userId, username, ...fields });
  }
  // Covers all onboarding steps (details/goals/finish) in one place.
  revalidateTag("profiles", { expire: 0 });
  revalidateTag("showcase", { expire: 0 });
}

export async function onboardingDetails(formData: FormData) {
  const user = await requireUser();
  const displayName =
    String(formData.get("displayName") ?? "").trim() || user.name || "Builder";
  await upsertProfile(user.id, {
    displayName,
    country: normalizeProfileCountry(String(formData.get("country") ?? "")),
    city: String(formData.get("city") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
    publicEmail: String(formData.get("publicEmail") ?? "").trim() || user.email,
  });
  redirect("/onboarding/goals");
}

export async function onboardingGoals(formData: FormData) {
  const user = await requireUser();
  await upsertProfile(user.id, {
    proudOf: String(formData.get("proudOf") ?? "").trim(),
    wantToAchieve: String(formData.get("wantToAchieve") ?? "").trim(),
  });
  redirect("/onboarding/connect");
}

export async function onboardingFinish(formData: FormData) {
  const user = await requireUser();
  await upsertProfile(user.id, {
    githubUrl: String(formData.get("githubUrl") ?? "").trim(),
    linkedinUrl: String(formData.get("linkedinUrl") ?? "").trim(),
    xUrl: String(formData.get("xUrl") ?? "").trim(),
    siteUrl: String(formData.get("siteUrl") ?? "").trim(),
    tradeStarsEnabled:
      (formData.get("tradeStarsEnabled") === "on" ||
        formData.get("tradeStarsEnabled") === "true") &&
      canEnableTradeStars(user),
  });
  // Fill any socials they left blank from their GitHub profile (links + website).
  if (user.githubLogin) {
    await backfillGithubSocials(user.id, user.githubLogin, user.accessToken ?? undefined);
  }
  revalidatePath("/profiles");
  revalidatePath("/home");
  redirect("/home");
}

/** Import links from the user's GitHub profile (website, LinkedIn, X) on demand. */
export async function importGithubSocials() {
  const { user, profile } = await getSessionContext();
  if (!user || !profile) redirect("/login");
  if (!user.githubLogin) redirect("/settings/account?error=no_github");
  await backfillGithubSocials(user.id, user.githubLogin, user.accessToken ?? undefined);
  revalidatePath("/settings/profile");
  redirect("/settings/account?imported=1");
}

export async function markGoalAchieved() {
  const { user, profile } = await getSessionContext();
  if (!user || !profile) redirect("/login");
  await db
    .update(profiles)
    .set({ achieved: true, achievedAt: new Date(), updatedAt: new Date() })
    .where(eq(profiles.userId, user.id));
  await recordEvent({
    type: "achieved",
    actorId: user.id,
    actorName: profile.displayName ?? user.name ?? "Someone",
    summary: `${profile.displayName ?? user.name} marked their goal achieved: "${profile.wantToAchieve ?? "their goal"}"`,
  });
  // The "goal hit" badge shows in the directory (listProfiles).
  revalidateTag("profiles", { expire: 0 });
  revalidatePath(
    user.githubLogin ? `/users/${user.githubLogin}` : `/profiles/${profile.id}`,
  );
  revalidatePath("/home");
}

/**
 * Server action: set the per-profile Trade Stars opt-in (global).
 * When enabling, kick off the background repo-star backfill.
 */
export async function setProfileTradeStars(formData: FormData) {
  const { user } = await requireOnboardedUser();
  // Only a GitHub-connected account can opt IN (opting out always allowed).
  const optIn =
    String(formData.get("optIn") ?? "") === "true" && canEnableTradeStars(user);

  await db
    .update(profiles)
    .set({ tradeStarsEnabled: optIn, updatedAt: new Date() })
    .where(eq(profiles.userId, user.id));

  // Browser state flips instantly; GitHub starring happens in the background.
  if (optIn && (await autoStarActive())) after(() => triggerStarTrade());

  revalidateTag("profiles", { expire: 0 });
  revalidateTag("stars", { expire: 0 });
  revalidateTag("showcase", { expire: 0 });
  revalidatePath("/discover");
}
