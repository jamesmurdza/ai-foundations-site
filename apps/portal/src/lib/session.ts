import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { env, cookieSecure } from "./env";

const COOKIE = "ss_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const secret = new TextEncoder().encode(env.authSecret);

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

// Request-deduped with React cache(): NavBar, Footer, the (app) layout and the
// page each ask "who is signed in" — this collapses them to a single cookie read
// + JWT verify per request. cache() is request-scoped (never shared across
// requests), so it is safe for cookie-derived data.
export const getSessionUserId = cache(async (): Promise<string | null> => {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
});

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
