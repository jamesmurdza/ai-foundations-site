// Netlify Scheduled Function — submission notification digest.
// Replaces the Vercel cron on Netlify: calls the dashboard's own cron endpoint
// with the shared secret.
import type { Config } from "@netlify/functions";

export default async () => {
  const base = process.env.CRON_TARGET_URL || process.env.URL || "";
  const res = await fetch(`${base}/dashboard/api/cron/notify-submissions`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET ?? ""}` },
  });
  return new Response(`notify-submissions -> ${res.status}`, {
    status: res.ok ? 200 : 502,
  });
};

export const config: Config = { schedule: "*/15 * * * *" };
