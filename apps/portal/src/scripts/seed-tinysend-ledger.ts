/**
 * One-off anti-blast seed for the tinysend sync.
 *
 * The HackerHouse applicant emails were already bulk-imported into tinysend, so we
 * mark every current hh_applications email (any status, valid email) as already
 * synced in the ledger. After this the reconciler cron's candidate set is just the
 * Portal users (ss_users) it still needs to import + any NEW applicants going forward.
 *
 * Makes ZERO tinysend API calls — it only writes our own ss_tinysend_subscribers
 * ledger, so it cannot blast the mailing list. Idempotent (ON CONFLICT DO NOTHING).
 * Does NOT seed ss_users — those are imported gradually by the cron.
 *   npm run seed:tinysend
 */
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  // Ensure the table exists even if `db:push` hasn't run yet (defensive; push is
  // the primary mechanism). ss_-namespaced — never touches hh_* tables.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ss_tinysend_subscribers (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL,
      name text,
      source text NOT NULL,
      synced_at timestamptz,
      last_error text,
      attempts integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS ss_tinysend_subscribers_email_idx ON ss_tinysend_subscribers (email)`,
  );

  const res = await pool.query(`
    INSERT INTO ss_tinysend_subscribers (id, email, name, source, synced_at, attempts)
    SELECT gen_random_uuid(), email, name, 'backfill_seed', now(), 0
    FROM (
      SELECT DISTINCT ON (lower(email)) lower(email) AS email, NULLIF(trim(name), '') AS name
      FROM hh_applications
      WHERE email IS NOT NULL AND trim(email) <> ''
      ORDER BY lower(email), (name IS NOT NULL) DESC
    ) s
    ON CONFLICT (email) DO NOTHING
  `);

  const [{ count }] = (
    await pool.query(
      `SELECT count(*)::int AS count FROM ss_tinysend_subscribers WHERE source = 'backfill_seed'`,
    )
  ).rows;
  console.log(`Seeded ${res.rowCount} new hh_applications emails as already-synced.`);
  console.log(`Ledger now holds ${count} backfill_seed rows total.`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
