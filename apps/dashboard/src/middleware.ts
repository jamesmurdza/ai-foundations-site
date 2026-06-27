import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";

import { verifyPassword } from "@/lib/auth";

const REALM = "Hacker House Admin";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

function decodeBase64(value: string): string {
  if (typeof atob !== "undefined") return atob(value);
  return Buffer.from(value, "base64").toString("utf8");
}

export async function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.toLowerCase().startsWith("basic ")) {
    return unauthorized();
  }

  let decoded: string;
  try {
    decoded = decodeBase64(auth.slice(6).trim());
  } catch {
    return unauthorized();
  }

  const sep = decoded.indexOf(":");
  if (sep <= 0) return unauthorized();
  const user = decoded.slice(0, sep).trim().toLowerCase();
  const pass = decoded.slice(sep + 1);
  if (!user || !pass) return unauthorized();

  if (!process.env.DATABASE_URL) {
    return new NextResponse("DATABASE_URL is not configured.", {
      status: 503,
    });
  }

  const sql = neon(process.env.DATABASE_URL);
  let rows: { password_hash: string }[];
  try {
    rows = (await sql`
      SELECT password_hash FROM hh_admins WHERE username = ${user} LIMIT 1
    `) as { password_hash: string }[];
  } catch {
    return new NextResponse("Auth service unavailable.", { status: 503 });
  }

  if (rows.length === 0) return unauthorized();

  const valid = await verifyPassword(pass, rows[0].password_hash);
  if (!valid) return unauthorized();

  const res = NextResponse.next();
  res.headers.set("x-admin-user", user);
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|api/cron).*)",
  ],
};
