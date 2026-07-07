import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@portal/db";
import { profiles } from "@portal/db/schema";
import {
  exchangeCodeForToken,
  fetchGithubIdentity,
} from "@portal/lib/auth";
import { upsertUserFromGithub, linkGithubToUser } from "@portal/lib/users";
import { createSession, getSessionUserId } from "@portal/lib/session";
import { sendEmail, templates } from "@portal/lib/email";
import { env } from "@portal/lib/env";

// Redirect to the public, basePath-aware URL (env.baseUrl already ends in /portal)
// — never req.url, which behind the multi-zone rewrite points at this deployment's
// raw origin and would drop the /portal prefix.
const appUrl = (path: string) => new URL(`${env.baseUrl}${path}`);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const expected = store.get("ss_oauth_state")?.value;
  store.delete("ss_oauth_state");
  const next = store.get("ss_oauth_next")?.value;
  store.delete("ss_oauth_next");

  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(appUrl("/login?error=state"));
  }

  try {
    const { accessToken, scope } = await exchangeCodeForToken(code);
    const identity = await fetchGithubIdentity(accessToken);

    // If already signed in (email-code flow), this is the "connect GitHub" step.
    const sessionUserId = await getSessionUserId();
    if (sessionUserId) {
      const res = await linkGithubToUser(sessionUserId, identity, accessToken, scope);
      return NextResponse.redirect(
        appUrl(
          res.ok ? "/onboarding/connect?connected=1" : "/onboarding/connect?error=link",
        ),
      );
    }

    const { user, isNew } = await upsertUserFromGithub(identity, accessToken, scope);
    await createSession(user.id);

    if (isNew && user.email) {
      const t = templates.welcome(user.name ?? identity.login);
      void sendEmail({
        to: user.email,
        type: "welcome",
        subject: t.subject,
        html: t.html,
        userId: user.id,
      });
    }

    // Explicit post-login destination (e.g. /dashboard). It lives outside /portal,
    // so use the site origin directly rather than appUrl() (which prefixes /portal).
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      // `next` is same-origin (e.g. /dashboard); resolve it against the request
      // origin so it never depends on NEXT_PUBLIC_SITE_URL being set correctly.
      return NextResponse.redirect(new URL(next, new URL(req.url).origin));
    }

    const [profile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    return NextResponse.redirect(appUrl(profile ? "/lessons" : "/onboarding"));
  } catch (e) {
    console.error("[oauth] callback failed", e);
    return NextResponse.redirect(appUrl("/login?error=oauth"));
  }
}
