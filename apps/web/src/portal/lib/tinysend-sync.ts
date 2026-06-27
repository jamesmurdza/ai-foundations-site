import "server-only";
import { and, inArray, isNull, sql } from "drizzle-orm";
import { db, pool } from "@portal/db";
import { tinysendSubscribers } from "@portal/db/schema";
import { importSubscribers } from "./tinysend";

// One import POST per run; the rest drains on the next cron tick. Keeps cold-start
// backfills gentle and bounds each run's work (mirrors the auto-star reconciler).
const MAX_EMAILS_PER_RUN = 200;

type Candidate = { email: string; name: string | null; source: string };

// Cross-source candidates: Portal users (real signups, excluding dev/test accounts)
// + everyone who entered a valid email in the summer-school form (any status, incl.
// drafts). Deduped to one row per lowercased email, then anti-joined against the
// ledger to find who still needs syncing. hh_applications is not in the Drizzle
// schema, so this uses the raw pool (same pattern as lib/applications.ts).
async function selectUnsynced(limit: number): Promise<Candidate[]> {
  const { rows } = await pool.query(
    `
    WITH candidates AS (
      SELECT lower(email) AS email, NULLIF(trim(name), '') AS name, 'ss_user' AS source, 2 AS pri
      FROM ss_users
      WHERE email IS NOT NULL AND trim(email) <> '' AND is_dev IS NOT TRUE
      UNION ALL
      SELECT lower(email), NULLIF(trim(name), ''), 'hh_application', 1
      FROM hh_applications
      WHERE email IS NOT NULL AND trim(email) <> ''
    ),
    deduped AS (
      SELECT DISTINCT ON (email) email, name, source
      FROM candidates
      ORDER BY email, pri DESC, (name IS NOT NULL) DESC
    )
    SELECT d.email, d.name, d.source
    FROM deduped d
    LEFT JOIN ss_tinysend_subscribers t ON t.email = d.email
    WHERE t.synced_at IS NULL
    ORDER BY d.email
    LIMIT $1
    `,
    [limit],
  );
  return rows.map((r: Record<string, unknown>) => ({
    email: r.email as string,
    name: (r.name as string) ?? null,
    source: r.source as string,
  }));
}

export type TinysendSyncResult = {
  candidates: number;
  imported: number;
  failed: number;
  skipped: boolean;
};

export async function runTinysendSync(): Promise<TinysendSyncResult> {
  const rows = await selectUnsynced(MAX_EMAILS_PER_RUN);
  if (rows.length === 0) return { candidates: 0, imported: 0, failed: 0, skipped: false };

  // Stage as un-synced (synced_at NULL) so a failed batch is retried next tick.
  await db
    .insert(tinysendSubscribers)
    .values(rows.map((r) => ({ email: r.email, name: r.name, source: r.source })))
    .onConflictDoNothing({ target: tinysendSubscribers.email });

  const result = await importSubscribers(rows.map((r) => ({ email: r.email, name: r.name })));
  const emails = rows.map((r) => r.email);

  if (!result.ok) {
    await db
      .update(tinysendSubscribers)
      .set({ attempts: sql`${tinysendSubscribers.attempts} + 1`, lastError: result.error ?? "unknown" })
      .where(and(inArray(tinysendSubscribers.email, emails), isNull(tinysendSubscribers.syncedAt)));
    return {
      candidates: rows.length,
      imported: 0,
      failed: rows.length,
      skipped: result.error === "tinysend_not_configured",
    };
  }

  // Success → claim them. Only rows still NULL (don't clobber a concurrent run).
  await db
    .update(tinysendSubscribers)
    .set({ syncedAt: new Date(), lastError: null, attempts: sql`${tinysendSubscribers.attempts} + 1` })
    .where(and(inArray(tinysendSubscribers.email, emails), isNull(tinysendSubscribers.syncedAt)));

  return { candidates: rows.length, imported: rows.length, failed: 0, skipped: false };
}

/**
 * Best-effort instant sync for a single new Portal user (the hybrid fast path).
 * Writes the same ledger on success so the cron skips it; on failure does nothing
 * and the cron backstop retries. Never throws.
 */
export async function syncOneToTinysend(
  email: string | null | undefined,
  name: string | null | undefined,
): Promise<void> {
  const clean = email?.trim().toLowerCase();
  if (!clean) return;
  try {
    const result = await importSubscribers([{ email: clean, name: name ?? undefined }]);
    if (!result.ok) return; // leave for the cron backstop
    await db
      .insert(tinysendSubscribers)
      .values({ email: clean, name: name ?? null, source: "ss_user", syncedAt: new Date() })
      .onConflictDoUpdate({
        target: tinysendSubscribers.email,
        set: { syncedAt: new Date(), lastError: null },
      });
  } catch {
    // swallow — the reconciler cron is the guaranteed path
  }
}
