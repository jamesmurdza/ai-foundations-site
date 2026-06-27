import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { webcrypto as nodeCrypto } from "node:crypto";

const subtle = nodeCrypto.subtle;

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

const ITERATIONS = 100_000;

function bytesToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomHex(bytes) {
  return bytesToHex(nodeCrypto.getRandomValues(new Uint8Array(bytes)));
}

async function hashPassword(plain) {
  const salt = randomHex(16);
  const enc = new TextEncoder();
  const key = await subtle.importKey(
    "raw",
    enc.encode(plain),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return `pbkdf2$${ITERATIONS}$${salt}$${bytesToHex(bits)}`;
}

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS hh_admins (
    username      TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;
console.log("OK: hh_admins table");

const existing = await sql`SELECT username FROM hh_admins`;
const existingSet = new Set(existing.map((r) => r.username.toLowerCase()));

const seedRaw = process.env.ADMIN_USERS ?? "";
let seeded = 0;
for (const pair of seedRaw.split(",")) {
  const idx = pair.indexOf(":");
  if (idx <= 0) continue;
  const username = pair.slice(0, idx).trim().toLowerCase();
  const password = pair.slice(idx + 1).trim();
  if (!username || !password) continue;
  if (existingSet.has(username)) {
    console.log("skip (exists):", username);
    continue;
  }
  const hash = await hashPassword(password);
  await sql`
    INSERT INTO hh_admins (username, password_hash)
    VALUES (${username}, ${hash})
  `;
  seeded += 1;
  console.log("seeded:", username);
}

const total = await sql`SELECT COUNT(*)::int AS n FROM hh_admins`;
console.log(`\ndone. seeded=${seeded}, total=${total[0].n}`);
