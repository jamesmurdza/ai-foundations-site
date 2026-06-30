// Real authentication for the dashboard, shared with the Portal.
//
// The dashboard no longer has its own passwords (hh_admins). Instead it trusts
// the Portal's GitHub-OAuth session: the `ss_session` JWT cookie (set on the
// shared aifoundations.school domain, path "/") is verified here with the SAME
// AUTH_SECRET as the Portal, and admin access is the SAME allowlist the Portal
// uses — ADMIN_EMAILS (env) or a row in ss_admins (managed in the Portal UI).
//
// Self-contained on purpose: middleware runs on the edge runtime, so this uses
// jose + the neon serverless driver only (no Node-only deps).
import { jwtVerify } from "jose";
import { neon } from "@neondatabase/serverless";

const COOKIE = "ss_session";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me-please-0000",
);

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// GitHub logins allowed into the dashboard. Self-contained: the dashboard gates
// on the GitHub identity itself (not the Portal admin allowlist), so it works on
// any domain. Defaults to the two maintainers; override via env.
const dashboardLogins = (process.env.DASHBOARD_ADMIN_LOGINS ?? "jamesmurdza,burhankhatri")
  .split(",")
  .map((l) => l.trim().toLowerCase())
  .filter(Boolean);

export type PortalAdmin = {
  userId: string;
  email: string | null;
  githubLogin: string | null;
  name: string | null;
};

function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  return neon(process.env.DATABASE_URL);
}

/** Verify the ss_session JWT and return the portal user id, or null. */
export async function verifySessionUserId(
  token: string | undefined,
): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Mirror of the Portal's isAllowlistedAdmin: ADMIN_EMAILS or a ss_admins row. */
export async function isAllowlistedAdmin(
  email: string | null,
  login: string | null,
): Promise<boolean> {
  const e = email?.trim().toLowerCase() || null;
  const l = login?.trim().toLowerCase() || null;
  if (e && adminEmails.includes(e)) return true;
  if (!e && !l) return false;
  const sql = db();
  // lower(col) = NULL evaluates to NULL (no match), so only the non-null side counts.
  const rows = (await sql`
    SELECT 1 FROM ss_admins
     WHERE lower(email) = ${e} OR lower(github_login) = ${l}
     LIMIT 1
  `) as unknown[];
  return rows.length > 0;
}

/**
 * Resolve the signed-in admin from the ss_session cookie. Returns null when there
 * is no valid session OR the user is not an admin (caller decides where to send them).
 */
export async function resolveAdmin(
  token: string | undefined,
): Promise<PortalAdmin | null> {
  const uid = await verifySessionUserId(token);
  if (!uid) return null;
  const sql = db();
  const rows = (await sql`
    SELECT id, email, github_login, name FROM ss_users WHERE id = ${uid} LIMIT 1
  `) as {
    id: string;
    email: string | null;
    github_login: string | null;
    name: string | null;
  }[];
  const u = rows[0];
  if (!u) return null;
  if (!(await isAllowlistedAdmin(u.email, u.github_login))) return null;
  return { userId: u.id, email: u.email, githubLogin: u.github_login, name: u.name };
}

/** Is this GitHub login allowed into the dashboard? (DASHBOARD_ADMIN_LOGINS) */
export function isDashboardLogin(login: string | null | undefined): boolean {
  return !!login && dashboardLogins.includes(login.toLowerCase());
}

/**
 * Resolve the signed-in user's GitHub login from the ss_session cookie, with NO
 * admin check — the dashboard gate applies its own DASHBOARD_ADMIN_LOGINS list.
 * Returns null when there is no valid session (i.e. "not signed in").
 */
export async function resolveSessionLogin(
  token: string | undefined,
): Promise<{ githubLogin: string | null } | null> {
  const uid = await verifySessionUserId(token);
  if (!uid) return null;
  const sql = db();
  const rows = (await sql`
    SELECT github_login FROM ss_users WHERE id = ${uid} LIMIT 1
  `) as { github_login: string | null }[];
  const u = rows[0];
  if (!u) return null;
  return { githubLogin: u.github_login };
}
