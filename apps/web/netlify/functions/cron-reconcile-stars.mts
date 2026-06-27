// Netlify Scheduled Function — auto-star reconciler.
// Replaces the Vercel cron (vercel.json) on Netlify: it calls the portal's own
// cron endpoint with the shared secret. The route is idempotent and resumable,
// so a short Netlify function timeout just means the next run picks up the rest.
import type { Config } from "@netlify/functions";

export default async () => {
  const base = process.env.CRON_TARGET_URL || process.env.URL || "";
  const res = await fetch(`${base}/portal/api/cron/reconcile-stars`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET ?? ""}` },
  });
  return new Response(`reconcile-stars -> ${res.status}`, {
    status: res.ok ? 200 : 502,
  });
};

export const config: Config = { schedule: "*/5 * * * *" };
