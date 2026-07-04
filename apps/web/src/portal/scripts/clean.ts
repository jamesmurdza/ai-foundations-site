/**
 * Removes test/dummy data from the ss_* namespace before launch.
 *
 *   npm run clean         # report row counts only (no changes)
 *   npm run clean -- --apply   # wipe transactional tables, keep the spine
 *
 * PRESERVES ss_admins (the founder allowlist). The curriculum (weeks &
 * assignments) is hardcoded in code, not the DB.
 * NEVER touches the read-only hh_* applicant tables.
 */
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Order doesn't matter (no FK constraints) but reads top-down nicely.
const WIPE = [
  "ss_attachments",
  "ss_files",
  "ss_feedback",
  "ss_review_assignments",
  "ss_comments",
  "ss_submissions",
  "ss_star_grants",
  "ss_star_trades",
  "ss_github_snapshots",
  "ss_checkins",
  "ss_week_step_completions",
  "ss_stream_reactions",
  "ss_qa_upvotes",
  "ss_qa_questions",
  "ss_stream_presence",
  "ss_events",
  "ss_email_logs",
  "ss_login_codes",
  "ss_resources",
  "ss_announcements",
  "ss_profiles",
  "ss_users",
];
const KEEP = ["ss_admins"];

async function count(table: string): Promise<number> {
  const { rows } = await pool.query(`select count(*)::int as n from ${table}`);
  return rows[0]?.n ?? 0;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const apply = process.argv.includes("--apply");

  console.log(apply ? "APPLY — removing dummy data\n" : "REPORT (dry run) — pass --apply to delete\n");

  console.log("Tables to wipe:");
  let total = 0;
  for (const t of WIPE) {
    const n = await count(t);
    total += n;
    console.log(`  ${t.padEnd(24)} ${n}`);
  }
  console.log(`  ${"TOTAL".padEnd(24)} ${total}\n`);

  console.log("Tables to keep:");
  for (const t of KEEP) {
    console.log(`  ${t.padEnd(24)} ${await count(t)}`);
  }

  // Show any non-test users so we never wipe a real person by accident.
  const { rows: realish } = await pool.query(
    `select email, github_login from ss_users
       where coalesce(email,'') not like '%@example.com'
       and is_dev = false
     limit 20`,
  );
  if (realish.length) {
    console.log("\nNon-@example.com, non-dev users present:");
    for (const r of realish) console.log(`  ${r.email ?? r.github_login}`);
  }

  if (!apply) {
    console.log("\nDry run complete. Nothing was deleted.");
    await pool.end();
    return;
  }

  console.log("\nDeleting…");
  for (const t of WIPE) {
    const res = await pool.query(`delete from ${t}`);
    console.log(`  ${t.padEnd(24)} -${res.rowCount}`);
  }

  await pool.end();
  console.log("\nDone. Run `npm run seed` to restore the admin allowlist.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
