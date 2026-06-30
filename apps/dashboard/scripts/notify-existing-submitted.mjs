// One-shot backlog mailer: send the thank-you to every status='submitted'
// applicant. Dry-runs by default; pass --send to actually send.
//
// On success of each send, sets notification_sent_at = NOW() so the cron
// won't re-send.
//
//   node scripts/notify-existing-submitted.mjs           # dry run
//   node scripts/notify-existing-submitted.mjs --send    # actually send

import { neon } from "@neondatabase/serverless";
import nodemailer from "nodemailer";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq < 0) continue;
  const k = trimmed.slice(0, eq).trim();
  let v = trimmed.slice(eq + 1).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  if (!process.env[k]) process.env[k] = v;
}

const SEND = process.argv.includes("--send");
const PAUSE_MS = 400;

for (const v of [
  "DATABASE_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
]) {
  if (!process.env[v]) throw new Error(`Missing env var: ${v}`);
}

const sql = neon(process.env.DATABASE_URL);

const rows = await sql`
  SELECT id, email, name, submitted_at, notification_sent_at
    FROM hh_applications
   WHERE status = 'submitted'
     AND email IS NOT NULL
     AND email <> ''
   ORDER BY submitted_at ASC
`;

console.log(
  `Found ${rows.length} submitted applications with a non-empty email.`,
);
console.log("");
for (const r of rows) {
  const prevSent = r.notification_sent_at
    ? `already-marked-at=${new Date(r.notification_sent_at).toISOString()}`
    : "not-yet-marked";
  console.log(
    `  ${r.id}  ${(r.email ?? "").padEnd(38)}  ${(r.name ?? "(no name)").padEnd(28)}  ${prevSent}`,
  );
}

if (!SEND) {
  console.log("");
  console.log("DRY RUN. To actually send, re-run with --send.");
  process.exit(0);
}

console.log("");
console.log(`SEND mode. About to email ${rows.length} applicants in 5s. Ctrl-C to abort.`);
await new Promise((res) => setTimeout(res, 5000));

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  requireTLS: Number(process.env.SMTP_PORT) === 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

await transport.verify();
console.log("SMTP verified.");
console.log("");

function firstNameOrFallback(name) {
  if (!name) return "there";
  const first = name.trim().split(/\s+/)[0];
  return first || "there";
}

function bodyFor(firstName) {
  return [
    `Hi ${firstName},`,
    "",
    "Thank you for applying to the AI Foundations Summer School. We'll try to get back to you soon. If you have any questions or updates please reply to this email.",
    "",
    "— The AI Foundations Team",
  ].join("\n");
}

let sent = 0;
let failed = 0;
const errors = [];

for (const r of rows) {
  try {
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: r.email,
      subject: "Thanks for your Summer School application",
      text: bodyFor(firstNameOrFallback(r.name)),
    });
    if (info.rejected && info.rejected.length > 0) {
      throw new Error(`rejected: ${info.rejected.join(", ")}`);
    }
    await sql`
      UPDATE hh_applications
         SET notification_sent_at = NOW()
       WHERE id = ${r.id}
    `;
    sent += 1;
    console.log(`  ✓ sent  → ${r.email}`);
  } catch (err) {
    failed += 1;
    const msg = err instanceof Error ? err.message : String(err);
    errors.push({ id: r.id, email: r.email, error: msg });
    console.log(`  ✗ FAIL  → ${r.email}: ${msg}`);
  }
  await new Promise((res) => setTimeout(res, PAUSE_MS));
}

console.log("");
console.log(`Done. sent=${sent}  failed=${failed}  total=${rows.length}`);
if (errors.length) {
  console.log("errors:");
  console.log(JSON.stringify(errors, null, 2));
}
