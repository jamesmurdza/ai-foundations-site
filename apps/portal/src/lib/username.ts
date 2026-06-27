import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";

/**
 * Turn any name/handle into a safe @username slug: lowercase, a-z0-9 and single
 * hyphens, 2–24 chars. GitHub logins pass through almost unchanged.
 */
export function slugifyUsername(raw: string): string {
  const s = (raw || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 24)
    .replace(/-+$/g, "");
  return s.length >= 2 ? s : "user";
}

/** True if `name` is already a well-formed handle (what we accept on edit). */
export function isValidUsername(name: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{0,22}[a-z0-9])?$/.test(name);
}

/**
 * Find a free username from a base name, appending -2, -3, … on collision.
 * `excludeUserId` lets a user keep their own current handle when re-saving.
 */
export async function ensureUniqueUsername(
  base: string,
  excludeUserId?: string,
): Promise<string> {
  const root = slugifyUsername(base);
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const [taken] = await db
      .select({ userId: profiles.userId })
      .from(profiles)
      .where(eq(profiles.username, candidate))
      .limit(1);
    if (!taken || taken.userId === excludeUserId) return candidate;
  }
  return `${root}-${Math.random().toString(36).slice(2, 6)}`;
}
