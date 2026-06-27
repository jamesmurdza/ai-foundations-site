import { hashPassword, isValidPassword, isValidUsername } from "./auth";
import { sql } from "./db";

export type Admin = {
  username: string;
  createdAt: string;
};

type Row = {
  username: string;
  password_hash: string;
  created_at: string | Date;
};

function toAdmin(r: Row): Admin {
  return {
    username: r.username,
    createdAt:
      r.created_at instanceof Date
        ? r.created_at.toISOString()
        : new Date(r.created_at).toISOString(),
  };
}

export async function listAdmins(): Promise<Admin[]> {
  const rows = (await sql`
    SELECT username, password_hash, created_at
      FROM hh_admins
     ORDER BY created_at ASC, username ASC
  `) as Row[];
  return rows.map(toAdmin);
}

export async function getAdminUsernames(): Promise<string[]> {
  const rows = (await sql`SELECT username FROM hh_admins ORDER BY username`) as {
    username: string;
  }[];
  return rows.map((r) => r.username);
}

export type CreateAdminError =
  | "invalid_username"
  | "invalid_password"
  | "username_taken";

export async function createAdmin(
  username: string,
  password: string,
): Promise<{ ok: true; admin: Admin } | { ok: false; error: CreateAdminError }> {
  const u = username.trim().toLowerCase();
  if (!isValidUsername(u)) return { ok: false, error: "invalid_username" };
  if (!isValidPassword(password)) return { ok: false, error: "invalid_password" };

  const existing = (await sql`
    SELECT 1 FROM hh_admins WHERE username = ${u} LIMIT 1
  `) as unknown[];
  if (existing.length > 0) return { ok: false, error: "username_taken" };

  const hash = await hashPassword(password);
  const inserted = (await sql`
    INSERT INTO hh_admins (username, password_hash)
    VALUES (${u}, ${hash})
    RETURNING username, password_hash, created_at
  `) as Row[];

  return { ok: true, admin: toAdmin(inserted[0]) };
}

export async function getAdminPasswordHash(
  username: string,
): Promise<string | null> {
  const rows = (await sql`
    SELECT password_hash FROM hh_admins WHERE username = ${username} LIMIT 1
  `) as { password_hash: string }[];
  return rows.length > 0 ? rows[0].password_hash : null;
}
