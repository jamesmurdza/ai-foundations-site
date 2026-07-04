/**
 * Seeds the admin allowlist from ADMIN_EMAILS. Safe + idempotent — only ss_
 * tables, never hh_.
 *
 * The curriculum (weeks & assignments) is NOT seeded — it's hardcoded in code at
 * src/portal/lib/curriculum.ts. To change the program, edit that file.
 *
 * Run: npm run seed
 */
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.length) {
    for (const email of adminEmails) {
      await pool.query(
        `insert into ss_admins (id, email, added_by) values ($1,$2,'seed')
         on conflict (email) do nothing`,
        [crypto.randomUUID(), email],
      );
    }
    const res = await pool.query(
      `update ss_users set is_admin = true where lower(email) = any($1::text[])`,
      [adminEmails],
    );
    console.log(
      `✓ admin allowlist seeded (${adminEmails.join(", ")}); ${res.rowCount} existing user(s) flagged`,
    );
  } else {
    console.log("No ADMIN_EMAILS set — nothing to seed.");
  }

  await pool.end();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
