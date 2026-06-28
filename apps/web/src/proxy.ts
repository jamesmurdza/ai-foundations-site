import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { resolveSessionLogin, isDashboardLogin } from "@dashboard/lib/portal-auth";

// Single proxy for the unified app, dispatched by path prefix:
//  - /dashboard/*  → admin gate (Portal session) + x-admin-user (cron excluded)
//  - /portal/*     → slide the session cookie's 30-day window (api excluded)
//  - everything else (site) → passthrough
const COOKIE = "ss_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const REFRESH_AFTER = 60 * 60 * 24; // re-issue once a token is >1 day old

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me-please-0000",
);
const cookieSecure = (
  process.env.NEXT_PUBLIC_BASE_URL ??
  process.env.AUTH_URL ??
  "http://localhost:3000"
).startsWith("https://");

async function dashboardGate(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  let signedIn = false;
  let login: string | null = null;
  try {
    const session = await resolveSessionLogin(token);
    signedIn = session !== null;
    login = session?.githubLogin ?? null;
  } catch {
    return new NextResponse("Auth service unavailable.", { status: 503 });
  }
  if (!isDashboardLogin(login)) {
    // Same-origin dashboard login page — no NEXT_PUBLIC_SITE_URL dependency, so it
    // can't bounce to a dead URL. Signed-in-but-not-allowed shows "not authorised".
    const url = new URL("/dashboard/login", req.url);
    if (signedIn) url.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(url);
  }
  const headers = new Headers(req.headers);
  headers.set("x-admin-user", login!);
  return NextResponse.next({ request: { headers } });
}

async function portalRefresh(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.next();
  try {
    const { payload } = await jwtVerify(token, secret);
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    const iat = typeof payload.iat === "number" ? payload.iat : 0;
    if (!sub) return NextResponse.next();
    if (Math.floor(Date.now() / 1000) - iat < REFRESH_AFTER) return NextResponse.next();
    const fresh = await new SignJWT({ sub })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);
    const res = NextResponse.next();
    res.cookies.set(COOKIE, fresh, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });
    return res;
  } catch {
    return NextResponse.next();
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/dashboard")) {
    if (pathname.startsWith("/dashboard/api/cron")) return NextResponse.next();
    if (pathname === "/dashboard/login") return NextResponse.next(); // public sign-in page
    return dashboardGate(req);
  }
  if (pathname.startsWith("/portal")) {
    if (pathname.startsWith("/portal/api")) return NextResponse.next(); // crons + auth handle themselves
    return portalRefresh(req);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/((?!_next/static|_next/image|api/cron).*)",
    "/portal/:path*",
  ],
};
