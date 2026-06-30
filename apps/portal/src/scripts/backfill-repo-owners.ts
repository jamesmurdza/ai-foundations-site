/**
 * One-off: derive repo_owner/repo_name for ss_submissions that have a GitHub
 * link payload but null repo columns (e.g. Week 1 profile links submitted as
 * github.com/<login>). This makes them starrable by the auto-star reconciler.
 * Idempotent — only touches rows where repo_owner IS NULL.
 *   npm run backfill:repo-owners
 * Never touches hh_* tables.
 */
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Mirror of deriveRepoRef() in src/lib/github-parse.ts (kept inline so this
// script has no app-module dependencies, matching backfill-usernames.ts).
function parseRepo(input: string): { owner: string; repo: string } | null {
  const s = (input || "").trim();
  const m =
    s.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/i) ||
    s.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
}
function parseLogin(input: string): string | null {
  const s = (input || "").trim();
  const m = s.match(/github\.com\/([^/\s#?]+)/i) || s.match(/^@?([\w-]+)$/);
  return m ? m[1] : null;
}
function deriveRepoRef(input: string): { owner: string; repo: string } | null {
  const r = parseRepo(input);
  if (r) return r;
  if (input && /github\.com\//i.test(input)) {
    const login = parseLogin(input);
    if (login) return { owner: login, repo: login };
  }
  return null;
}

async function main() {
  const { rows } = await pool.query<{ id: string; payload: string }>(
    `SELECT id, payload FROM ss_submissions WHERE repo_owner IS NULL`,
  );
  let updated = 0;
  for (const row of rows) {
    const ref = deriveRepoRef(row.payload);
    if (!ref) continue;
    await pool.query(
      `UPDATE ss_submissions SET repo_owner = $1, repo_name = $2 WHERE id = $3`,
      [ref.owner, ref.repo, row.id],
    );
    updated++;
    console.log(`  ${row.payload}  ->  ${ref.owner}/${ref.repo}`);
  }
  console.log(`\nBackfilled ${updated} / ${rows.length} null-repo submissions.`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
