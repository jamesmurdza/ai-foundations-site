import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import {
  exchangeCodeForToken,
  fetchGithubIdentity,
} from "@/lib/auth";
import { upsertUserFromGithub, linkGithubToUser } from "@/lib/users";
import { createSession, getSessionUserId } from "@/lib/session";
import { sendEmail, templates } from "@/lib/email";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const expected = store.get("ss_oauth_state")?.value;
  store.delete("ss_oauth_state");

  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(new URL("/login?error=state", req.url));
  }

  try {
    const { accessToken, scope } = await exchangeCodeForToken(code);
    const identity = await fetchGithubIdentity(accessToken);

    // If already signed in (email-code flow), this is the "connect GitHub" step.
    const sessionUserId = await getSessionUserId();
    if (sessionUserId) {
      const res = await linkGithubToUser(sessionUserId, identity, accessToken, scope);
      return NextResponse.redirect(
        new URL(
          res.ok ? "/onboarding/connect?connected=1" : "/onboarding/connect?error=link",
          req.url,
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

    const [profile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    return NextResponse.redirect(
      new URL(profile ? "/home" : "/onboarding", req.url),
    );
  } catch (e) {
    console.error("[oauth] callback failed", e);
    return NextResponse.redirect(new URL("/login?error=oauth", req.url));
  }
}
