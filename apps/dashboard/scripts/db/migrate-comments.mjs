import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../../.env.local");

for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq < 0) continue;
  const k = trimmed.slice(0, eq).trim();
  const v = trimmed.slice(eq + 1).trim();
  if (!process.env[k]) process.env[k] = v;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set");
}

const sql = neon(process.env.DATABASE_URL);

const stmts = [
  `CREATE TABLE IF NOT EXISTS hh_comments (
    id              TEXT PRIMARY KEY,
    application_id  TEXT NOT NULL REFERENCES hh_applications(id) ON DELETE CASCADE,
    author          TEXT NOT NULL,
    body            TEXT NOT NULL,
    mentions        TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS hh_comments_app_idx ON hh_comments(application_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS hh_comments_mentions_idx ON hh_comments USING GIN (mentions)`,
  `CREATE TABLE IF NOT EXISTS hh_visits (
    username        TEXT NOT NULL,
    application_id  TEXT NOT NULL,
    last_visit_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (username, application_id)
  )`,
];

for (const stmt of stmts) {
  await sql.query(stmt);
  console.log("OK:", stmt.split("\n")[0]);
}

console.log("\ndone.");
