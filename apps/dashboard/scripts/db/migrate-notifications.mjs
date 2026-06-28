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
  `ALTER TABLE hh_applications ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ`,
  `CREATE INDEX IF NOT EXISTS hh_applications_notification_pending_idx
     ON hh_applications(submitted_at)
     WHERE status = 'submitted' AND notification_sent_at IS NULL`,
];

for (const stmt of stmts) {
  await sql.query(stmt);
  console.log("OK:", stmt.split("\n")[0]);
}

const cols = await sql.query(
  `SELECT column_name FROM information_schema.columns
    WHERE table_name = 'hh_applications' ORDER BY ordinal_position`,
);
console.log("\ncolumns:", cols.map((c) => c.column_name).join(", "));
