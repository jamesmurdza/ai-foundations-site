import "server-only";
import { createHash } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { loginCodes } from "@/db/schema";

const TTL_MS = 30 * 60 * 1000; // 30 minutes — survives slow SMTP delivery
const MAX_ATTEMPTS = 6;

/** Why a verification failed, so the UI can show a precise message. */
export type VerifyResult = "ok" | "expired" | "wrong" | "locked";

function hash(code: string): string {
  return createHash("sha256").update(code.trim()).digest("hex");
}

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Sign-up is OPEN: anyone with a well-formed email may request a login code. We
 * deliberately no longer require a matching application or an admin allowlist
 * entry — this predicate is the *only* gate. It lives here (not inline in the
 * action) so the policy is unit-tested and any future re-gating is a visible,
 * deliberate edit. NOTE: because this is reachable by anyone, the request path
 * is an open email-trigger — pair it with rate limiting before wider exposure.
 */
export function mayRequestLoginCode(email: string): boolean {
  return email.trim().includes("@");
}

/** Create a fresh 6-digit code for an email, invalidating any prior ones. */
export async function createLoginCode(email: string): Promise<string> {
  const clean = email.trim().toLowerCase();
  await db
    .update(loginCodes)
    .set({ consumed: true })
    .where(and(eq(loginCodes.email, clean), eq(loginCodes.consumed, false)));
  const code = generateCode();
  await db.insert(loginCodes).values({
    email: clean,
    codeHash: hash(code),
    expiresAt: new Date(Date.now() + TTL_MS),
  });
  return code;
}

/**
 * Pure decision for a verification attempt (no DB). A missing row almost always
 * means the code expired or was superseded by a resend — treat as "expired" so
 * the UI points the user at Resend rather than saying "wrong".
 */
export function classifyCode(
  row: { codeHash: string; expiresAt: Date | string; attempts: number } | undefined,
  code: string,
  now: number = Date.now(),
): VerifyResult {
  if (!row) return "expired";
  if (new Date(row.expiresAt).getTime() < now) return "expired";
  if (row.attempts >= MAX_ATTEMPTS) return "locked";
  return row.codeHash === hash(code) ? "ok" : "wrong";
}

export async function verifyCode(
  email: string,
  code: string,
): Promise<VerifyResult> {
  const clean = email.trim().toLowerCase();
  const [row] = await db
    .select()
    .from(loginCodes)
    .where(and(eq(loginCodes.email, clean), eq(loginCodes.consumed, false)))
    .orderBy(desc(loginCodes.createdAt))
    .limit(1);

  const result = classifyCode(row, code);
  if (result === "ok" && row) {
    await db.update(loginCodes).set({ consumed: true }).where(eq(loginCodes.id, row.id));
  } else if (result === "wrong" && row) {
    await db
      .update(loginCodes)
      .set({ attempts: row.attempts + 1 })
      .where(eq(loginCodes.id, row.id));
  }
  return result;
}
