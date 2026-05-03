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

const ddl = [
  `CREATE TABLE IF NOT EXISTS hh_applications (
    id                TEXT PRIMARY KEY,
    email             TEXT,
    name              TEXT,
    answers           JSONB NOT NULL DEFAULT '{}'::jsonb,
    dynamic_questions JSONB,
    status            TEXT NOT NULL DEFAULT 'in_progress',
    why_text          TEXT,
    project_text      TEXT,
    portfolio_url     TEXT,
    github_url        TEXT,
    other_url         TEXT,
    step              TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at      TIMESTAMPTZ
  )`,
  `CREATE INDEX IF NOT EXISTS hh_applications_email_idx  ON hh_applications(email)`,
  `CREATE INDEX IF NOT EXISTS hh_applications_status_idx ON hh_applications(status)`,
];

for (const stmt of ddl) {
  await sql.query(stmt);
  const head = stmt.split("\n")[0];
  console.log("OK:", head);
}

const rows = await sql.query(
  `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'hh_applications' ORDER BY ordinal_position`
);
console.log("\nhh_applications columns:");
for (const r of rows) console.log(`  ${r.column_name.padEnd(20)} ${r.data_type}`);
