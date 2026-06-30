import "server-only";
import { eq, or, sql, type SQL } from "drizzle-orm";
import { db } from "@portal/db";
import { admins } from "@portal/db/schema";
import { env } from "./env";
import { parseLogin } from "./github-parse";

/**
 * Admin access is an explicit allowlist locked to the founders. A user is an
 * admin if their email is in ADMIN_EMAILS (permanent backstop, can't be locked
 * out) OR their email / GitHub login is in ss_admins (managed in the UI).
 */
export async function isAllowlistedAdmin(
  email?: string | null,
  login?: string | null,
): Promise<boolean> {
  const e = email?.trim().toLowerCase() || null;
  const l = login?.trim().toLowerCase() || null;

  if (e && env.adminEmails.includes(e)) return true;
  if (!e && !l) return false;

  const conds: SQL[] = [];
  if (e) conds.push(eq(sql`lower(${admins.email})`, e));
  if (l) conds.push(eq(sql`lower(${admins.githubLogin})`, l));
  if (!conds.length) return false;

  const rows = await db
    .select({ id: admins.id })
    .from(admins)
    .where(conds.length === 1 ? conds[0] : or(...conds))
    .limit(1);
  return rows.length > 0;
}

export async function listAdmins() {
  return db.select().from(admins).orderBy(admins.createdAt);
}

/** Add an admin by email or GitHub username/URL. */
export async function addAdmin(
  identifier: string,
  name: string | null,
  addedBy: string | null,
): Promise<void> {
  const raw = identifier.trim();
  if (!raw) return;
  if (raw.includes("@")) {
    await db
      .insert(admins)
      .values({ email: raw.toLowerCase(), name, addedBy })
      .onConflictDoNothing();
  } else {
    const login = parseLogin(raw);
    if (!login) return;
    await db.insert(admins).values({ githubLogin: login, name, addedBy });
  }
}

export async function removeAdmin(id: string): Promise<void> {
  await db.delete(admins).where(eq(admins.id, id));
}
