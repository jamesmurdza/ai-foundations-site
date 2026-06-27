// One-time attribution migration for the Basic-Auth -> GitHub-auth swap.
//
// The dashboard used to write the hh_admins *username* (e.g. "burhan") as the
// identity in hh_comments.author / hh_stars.username / hh_visits.username and in
// hh_comments.mentions[]. After the auth swap the identity is the GitHub login.
// This remaps historical rows so old activity stays attributed to the same person.
//
// Safe to run repeatedly (idempotent): once a username is remapped, no rows with
// the old key remain. Conflict-safe for the (username, application_id) PKs of
// hh_stars / hh_visits (drops an old-key row when the new identity already has one).
//
// Usage:
//   node --env-file=apps/dashboard/.env.local apps/dashboard/scripts/migrate-attribution.mjs            # dry run
//   node --env-file=apps/dashboard/.env.local apps/dashboard/scripts/migrate-attribution.mjs --apply    # apply
//
// Only confidently-mappable founders are included. Admins without a known GitHub
// login (e.g. they haven't connected GitHub in the Portal) are left untouched and
// reported — add them here once their ss_users.github_login is known.
import { neon } from "@neondatabase/serverless";

const MAPPING = {
  burhan: "burhankhatri",
  james: "jamesmurdza",
};

const apply = process.argv.includes("--apply");
const sql = neon(process.env.DATABASE_URL);

function log(...a) { console.log(...a); }

// Verify every target GitHub login actually exists in ss_users before touching data.
for (const [, login] of Object.entries(MAPPING)) {
  const r = await sql`SELECT 1 FROM ss_users WHERE lower(github_login) = ${login} LIMIT 1`;
  if (r.length === 0) {
    console.error(`ABORT: target github login "${login}" not found in ss_users`);
    process.exit(1);
  }
}

log(apply ? "=== APPLY ===" : "=== DRY RUN (no changes) ===");

for (const [oldName, newName] of Object.entries(MAPPING)) {
  const [c] = await sql`SELECT count(*)::int n FROM hh_comments WHERE author = ${oldName}`;
  const [s] = await sql`SELECT count(*)::int n FROM hh_stars WHERE username = ${oldName}`;
  const [v] = await sql`SELECT count(*)::int n FROM hh_visits WHERE username = ${oldName}`;
  const [m] = await sql`SELECT count(*)::int n FROM hh_comments WHERE ${oldName} = ANY(mentions)`;
  log(`  ${oldName} -> ${newName}: comments=${c.n} stars=${s.n} visits=${v.n} mentions=${m.n}`);

  if (!apply) continue;

  await sql`UPDATE hh_comments SET author = ${newName} WHERE author = ${oldName}`;
  // stars/visits have PK (username, application_id): drop old rows that would
  // collide with an existing new-identity row, then rename the remainder.
  await sql`DELETE FROM hh_stars o WHERE o.username = ${oldName}
            AND EXISTS (SELECT 1 FROM hh_stars n WHERE n.username = ${newName} AND n.application_id = o.application_id)`;
  await sql`UPDATE hh_stars SET username = ${newName} WHERE username = ${oldName}`;
  await sql`DELETE FROM hh_visits o WHERE o.username = ${oldName}
            AND EXISTS (SELECT 1 FROM hh_visits n WHERE n.username = ${newName} AND n.application_id = o.application_id)`;
  await sql`UPDATE hh_visits SET username = ${newName} WHERE username = ${oldName}`;
  await sql`UPDATE hh_comments SET mentions = array_replace(mentions, ${oldName}, ${newName})
            WHERE ${oldName} = ANY(mentions)`;
}

// Report any other identities still present that are NOT in the mapping.
const mapped = new Set(Object.keys(MAPPING).concat(Object.values(MAPPING)));
const seen = new Set();
for (const row of await sql`SELECT DISTINCT author AS u FROM hh_comments`) seen.add(row.u);
for (const row of await sql`SELECT DISTINCT username AS u FROM hh_stars`) seen.add(row.u);
for (const row of await sql`SELECT DISTINCT username AS u FROM hh_visits`) seen.add(row.u);
const unmapped = [...seen].filter((u) => u && !mapped.has(u));
if (unmapped.length) {
  log(`\nNOT migrated (no known GitHub login) — add to MAPPING when known: ${unmapped.join(", ")}`);
}
log(apply ? "\nDone." : "\nDry run complete — re-run with --apply to migrate.");
