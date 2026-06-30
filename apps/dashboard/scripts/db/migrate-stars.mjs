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
  `CREATE TABLE IF NOT EXISTS hh_stars (
    username        TEXT NOT NULL,
    application_id  TEXT NOT NULL REFERENCES hh_applications(id) ON DELETE CASCADE,
    starred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (username, application_id)
  )`,
  `CREATE INDEX IF NOT EXISTS hh_stars_app_idx ON hh_stars(application_id)`,
  `CREATE INDEX IF NOT EXISTS hh_stars_user_idx ON hh_stars(username, starred_at DESC)`,
];

for (const stmt of stmts) {
  await sql.query(stmt);
  console.log("OK:", stmt.split("\n")[0]);
}

console.log("\ndone.");
