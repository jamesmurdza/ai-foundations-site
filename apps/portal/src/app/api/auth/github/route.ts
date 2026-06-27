import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { githubAuthorizeUrl } from "@/lib/auth";
import { githubConfigured, cookieSecure } from "@/lib/env";

export async function GET(req: Request) {
  if (!githubConfigured) {
    return NextResponse.redirect(
      new URL("/login?error=github_not_configured", req.url),
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
