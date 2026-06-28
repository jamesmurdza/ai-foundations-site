import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { githubAuthorizeUrl } from "@portal/lib/auth";
import { githubConfigured, cookieSecure, env } from "@portal/lib/env";

export async function GET(req: Request) {
  if (!githubConfigured) {
    return NextResponse.redirect(
      new URL(`${env.baseUrl}/login?error=github_not_configured`),
    );
  }
  const state = crypto.randomUUID();
  const store = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };
  store.set("ss_oauth_state", state, cookieOpts);

  // Optional post-login destination (e.g. /dashboard, which lives outside /portal).
  // Safe relative paths only — never an absolute/external URL.
  const next = new URL(req.url).searchParams.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    store.set("ss_oauth_next", next, cookieOpts);
  }

  return NextResponse.redirect(githubAuthorizeUrl(state));
}
