// Netlify Scheduled Function — tinysend mailing-list sync.
// Replaces the Vercel cron on Netlify: calls the portal's own cron endpoint
// with the shared secret. The sync is anti-joined against the ledger and
// idempotent, so re-runs never double-import.
import type { Config } from "@netlify/functions";

export default async () => {
  const base = process.env.CRON_TARGET_URL || process.env.URL || "";
  const res = await fetch(`${base}/portal/api/cron/sync-tinysend`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET ?? ""}` },
  });
  return new Response(`sync-tinysend -> ${res.status}`, {
    status: res.ok ? 200 : 502,
  });
};

export const config: Config = { schedule: "*/10 * * * *" };
