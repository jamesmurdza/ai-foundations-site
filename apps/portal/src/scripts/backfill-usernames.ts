/**
 * One-off: give every existing ss_profiles row a unique @username.
 * New profiles get one at creation (see src/lib/username.ts); this fills the
 * rows that predate the column. Idempotent — only touches null usernames.
 *   npm run backfill:usernames
 * Never touches hh_* tables.
 */
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Mirror of slugifyUsername() in src/lib/username.ts.
function slugify(raw: string): string {
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

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");

  const { rows } = await pool.query(
    `select p.id, p.display_name, u.github_login, u.email
       from ss_profiles p
       left join ss_users u on u.id = p.user_id
      where p.username is null
      order by p.created_at asc`,
  );
  const { rows: takenRows } = await pool.query(
    `select username from ss_profiles where username is not null`,
  );
  const used = new Set<string>(takenRows.map((r) => r.username));

  for (const r of rows) {
    const seed =
      r.github_login ||
      r.display_name ||
      (r.email ? String(r.email).split("@")[0] : "") ||
      "user";
    const base = slugify(seed);
    let candidate = base;
    let i = 1;
    while (used.has(candidate)) {
      i++;
      candidate = `${base}-${i}`;
    }
    used.add(candidate);
    await pool.query(`update ss_profiles set username = $1 where id = $2`, [
      candidate,
      r.id,
    ]);
    console.log(`  ${r.id}  ->  @${candidate}`);
  }

  console.log(`\nBackfilled ${rows.length} username(s).`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
