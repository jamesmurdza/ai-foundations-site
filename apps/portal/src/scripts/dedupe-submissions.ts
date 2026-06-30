/**
 * One-off: collapse duplicate submissions so there's one per (assignment, user).
 * Older rows came from a bug where "resubmit" inserted a new row instead of
 * editing. Keeps the NEWEST submission per (assignment_id, user_id), repoints
 * star-trades at it, and deletes the older rows + their dependents.
 *   npm run dedupe:submissions
 * Run before adding the unique index. Only touches ss_* tables.
 */
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/** Choose the row to keep for a group of duplicates: newest by created_at. */
export function pickKeeper<T extends { id: string; createdAt: string | Date }>(
  rows: T[],
): T {
  return [...rows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const c = await pool.connect();
  try {
    await c.query("begin");
    const { rows } = await c.query(
      `select id, assignment_id, user_id, created_at
         from ss_submissions order by created_at desc`,
    );

    const groups = new Map<string, { id: string; createdAt: string }[]>();
    for (const r of rows) {
      const key = `${r.assignment_id}::${r.user_id}`;
      const list = groups.get(key) ?? [];
      list.push({ id: r.id, createdAt: String(r.created_at) });
      groups.set(key, list);
    }

    const oldIds: string[] = [];
    let dupeGroups = 0;
    for (const list of groups.values()) {
      if (list.length < 2) continue;
      dupeGroups++;
      const keeper = pickKeeper(list);
      const drop = list.filter((r) => r.id !== keeper.id).map((r) => r.id);
      // Point any star-trades that referenced a dropped submission at the keeper.
      await c.query(
        `update ss_star_trades set submission_id = $1
           where submission_id = any($2::text[])`,
        [keeper.id, drop],
      );
      oldIds.push(...drop);
    }

    const deps = { attachments: 0, feedback: 0, comments: 0, reviews: 0, events: 0, subs: 0 };
    if (oldIds.length) {
      deps.attachments = (
        await c.query(
          `delete from ss_attachments where target_type='submission' and target_id = any($1::text[])`,
          [oldIds],
        )
      ).rowCount ?? 0;
      deps.feedback = (
        await c.query(`delete from ss_feedback where submission_id = any($1::text[])`, [oldIds])
      ).rowCount ?? 0;
      deps.comments = (
        await c.query(
          `delete from ss_comments where target_type='submission' and target_id = any($1::text[])`,
          [oldIds],
        )
      ).rowCount ?? 0;
      deps.reviews = (
        await c.query(`delete from ss_review_assignments where submission_id = any($1::text[])`, [oldIds])
      ).rowCount ?? 0;
      deps.events = (
        await c.query(
          `delete from ss_events where target_type='submission' and target_id = any($1::text[])`,
          [oldIds],
        )
      ).rowCount ?? 0;
      deps.subs = (
        await c.query(`delete from ss_submissions where id = any($1::text[])`, [oldIds])
      ).rowCount ?? 0;
    }

    await c.query("commit");
    console.log(
      JSON.stringify({ duplicateGroups: dupeGroups, removedSubmissions: deps.subs, dependents: deps }, null, 2),
    );
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
  }
  await pool.end();
}

// Only run when invoked directly (not when imported by unit tests).
const entry = process.argv[1]?.replace(/\\/g, "/") ?? "";
if (entry.endsWith("dedupe-submissions.ts")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
