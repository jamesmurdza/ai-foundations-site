import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { resolveAdmin, verifySessionUserId } from "@/lib/portal-auth";

// Next 16 renamed Middleware -> Proxy. Real auth (replaces the old HTTP Basic
// Auth): the dashboard is gated by the Portal's GitHub-OAuth session. The shared
// `ss_session` cookie (path "/" on aifoundations.school) means one Portal login
// also authenticates /dashboard.
const COOKIE = "ss_session";
// Public host root used to bounce unauthenticated users to the Portal login.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function proxy(req: NextRequest) {
  // The cron route authenticates with CRON_SECRET in the handler — never gate it
  // behind a session. (basePath is stripped from nextUrl.pathname here.)
  if (req.nextUrl.pathname.startsWith("/api/cron")) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;

  let admin = null;
  let signedIn = false;
  try {
    // A valid session means "signed in" (even if not an admin); an invalid or
    // missing cookie means "not signed in".
    signedIn = (await verifySessionUserId(token)) !== null;
    admin = signedIn ? await resolveAdmin(token) : null;
  } catch {
    return new NextResponse("Auth service unavailable.", { status: 503 });
  }

  if (!admin) {
    // Signed in but not an admin → Portal home; otherwise → Portal login.
    const dest = signedIn ? `${SITE_URL}/portal/home` : `${SITE_URL}/portal/login`;
    return NextResponse.redirect(dest);
  }

  // Forward the admin identity to routes/pages via a REQUEST header (readable by
  // headers()), and overwrite any client-supplied value so it can't be spoofed.
  // x-admin-user is now the GitHub login (was the hh_admins username pre-swap).
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-admin-user", admin.githubLogin ?? admin.email ?? "admin");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Include "/" explicitly: under basePath the index (/dashboard) is not caught by
  // the catch-all pattern, and the dashboard relies on this proxy to gate auth.
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|api/cron).*)",
  ],
};
