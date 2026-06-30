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
  `ALTER TABLE hh_applications ADD COLUMN IF NOT EXISTS admin_status TEXT DEFAULT 'pending'`,
  `ALTER TABLE hh_applications ADD COLUMN IF NOT EXISTS admin_notes TEXT`,
  `CREATE INDEX IF NOT EXISTS hh_applications_admin_status_idx ON hh_applications(admin_status)`,
];

for (const stmt of stmts) {
  await sql.query(stmt);
  console.log("OK:", stmt.slice(0, 80));
}

const cols = await sql.query(
  `SELECT column_name FROM information_schema.columns WHERE table_name = 'hh_applications' ORDER BY ordinal_position`,
);
console.log("\ncolumns:", cols.map((c) => c.column_name).join(", "));
