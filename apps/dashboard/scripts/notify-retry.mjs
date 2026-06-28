// Retry the 3 IDs that failed in the backlog mailer with "Connection closed
// unexpectedly". Sends one at a time, marks notification_sent_at on success.
// On failure, NULLs the column so the cron will retry it later.

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

const RETRY_IDS = [
  "O5GGsRY7ScFchWXe",
  "RUqsnSkQuHBMJ0HR",
  "zuM9Wjt7xxIb8xkv",
];

const sql = neon(process.env.DATABASE_URL);

const rows = await sql`
  SELECT id, email, name FROM hh_applications
   WHERE id = ANY(${RETRY_IDS})
`;

console.log(`Retrying ${rows.length} rows.`);

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  requireTLS: Number(process.env.SMTP_PORT) === 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

await transport.verify();
console.log("SMTP verified.\n");

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
    console.log(`  ✗ FAIL  → ${r.email}: ${msg}`);
    // Null the column so the cron will retry it later.
    await sql`
      UPDATE hh_applications
         SET notification_sent_at = NULL
       WHERE id = ${r.id}
    `;
    console.log(`           (notification_sent_at set to NULL — cron will retry)`);
  }
  // Bigger pause between sends — ImprovMX seems to choke on rapid reconnects.
  await new Promise((res) => setTimeout(res, 3000));
}

console.log(`\nDone. sent=${sent} failed=${failed}`);
