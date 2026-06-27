import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { getSessionUserId } from "./session";
import { env } from "./env";
import { isAllowlistedAdmin } from "./admins";
import type { User, Profile } from "@/db/schema";

export const GITHUB_SCOPES = ["read:user", "user:email", "public_repo", "user:follow"];

// React cache(): request-deduped so the signed-in user's row is fetched once per
// request even though NavBar, Footer, the (app) layout and the page all ask.
// Request-scoped only — never shared across requests, so safe for per-user data.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const uid = await getSessionUserId();
  if (!uid) return null;
  const [u] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  return u ?? null;
});

export const getSessionContext = cache(async (): Promise<{
  user: User | null;
  profile: Profile | null;
}> => {
  const user = await getCurrentUser();
  if (!user) return { user: null, profile: null };
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  return { user, profile: profile ?? null };
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require a user who has completed onboarding (has a profile). */
export async function requireOnboardedUser(): Promise<{
  user: User;
  profile: Profile;
}> {
  const { user, profile } = await getSessionContext();
  if (!user) redirect("/login");
  if (!profile) redirect("/onboarding");
  return { user, profile };
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  // Live allowlist check so revoking access takes effect immediately.
  const ok = await isAllowlistedAdmin(user.email, user.githubLogin);
  if (!ok) redirect("/home");
  return user;
}

/* ---- GitHub OAuth (login flow) ------------------------------------------ */

export function githubAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.githubId,
    redirect_uri: `${env.baseUrl}/api/auth/callback/github`,
    scope: GITHUB_SCOPES.join(" "),
    state,
    allow_signup: "true",
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
  scope: string;
}> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.githubId,
      client_secret: env.githubSecret,
      code,
      redirect_uri: `${env.baseUrl}/api/auth/callback/github`,
    }),
  });
  const data = (await res.json()) as {
    access_token?: string;
    scope?: string;
    error_description?: string;
  };
  if (!data.access_token) {
    throw new Error(data.error_description || "GitHub token exchange failed");
  }
  return { accessToken: data.access_token, scope: data.scope ?? "" };
}

export type GithubIdentity = {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string;
  email: string | null;
};

export async function fetchGithubIdentity(token: string): Promise<GithubIdentity> {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "ai-foundations-portal",
  };
  const userRes = await fetch("https://api.github.com/user", { headers });
  if (!userRes.ok) throw new Error("Failed to fetch GitHub user");
  const u = (await userRes.json()) as {
    id: number;
    login: string;
    name: string | null;
    avatar_url: string;
    email: string | null;
  };

  let email = u.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers,
    });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as {
        email: string;
        primary: boolean;
        verified: boolean;
      }[];
      email =
        emails.find((e) => e.primary && e.verified)?.email ??
        emails.find((e) => e.verified)?.email ??
        emails[0]?.email ??
        null;
    }
  }

  return {
    id: u.id,
    login: u.login,
    name: u.name,
    avatarUrl: u.avatar_url,
    email,
  };
}
