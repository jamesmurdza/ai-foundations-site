import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { githubAuthorizeUrl } from "@portal/lib/auth";
import { githubConfigured, cookieSecure, env } from "@portal/lib/env";

export async function GET() {
  if (!githubConfigured) {
    return NextResponse.redirect(
      new URL(`${env.baseUrl}/login?error=github_not_configured`),
    );
  }
  const state = crypto.randomUUID();
  const store = await cookies();
  store.set("ss_oauth_state", state, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return NextResponse.redirect(githubAuthorizeUrl(state));
}
