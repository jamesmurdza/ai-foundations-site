import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

// Next.js 16 renamed Middleware to Proxy. This runs on the Node runtime and does
// ONE lightweight thing: slide the session cookie's 30-day window for active
// users so nobody gets logged out mid-cohort. Auth itself is still enforced in
// each server component / action — this never blocks a request.

const COOKIE = "ss_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const REFRESH_AFTER = 60 * 60 * 24; // only re-issue once a token is >1 day old

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me-please-0000",
);
const cookieSecure = (
  process.env.NEXT_PUBLIC_BASE_URL ??
  process.env.AUTH_URL ??
  "http://localhost:3000"
).startsWith("https://");

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.next();

  try {
    const { payload } = await jwtVerify(token, secret);
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    const iat = typeof payload.iat === "number" ? payload.iat : 0;
    if (!sub) return NextResponse.next();

    const ageSeconds = Math.floor(Date.now() / 1000) - iat;
    if (ageSeconds < REFRESH_AFTER) return NextResponse.next();

    const fresh = await new SignJWT({ sub })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    const response = NextResponse.next();
    response.cookies.set(COOKIE, fresh, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });
    return response;
  } catch {
    // Invalid/expired token — leave it untouched; the app treats it as logged out.
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
