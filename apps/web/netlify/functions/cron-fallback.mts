// Netlify Scheduled Function — single twice-daily fallback drain for all three crons.
//
// Real-time work is event-driven (fire-and-forget `after()` hooks on user creation,
// application submit, and submission/opt-in). This scheduled function is ONLY the
// safety net that catches failed instant sends and HackerHouse applicants with no
// Portal user row. Running it rarely (08:00 & 20:00 UTC) lets Neon scale to zero the
// rest of the day instead of being kept awake 24/7 by a */5 cron.
//
// The three routes are fetched in series so the whole run is ONE Neon wake window.
// Each underlying route is idempotent/resumable, so a truncated run just continues
// next tick. Failures are isolated per route.
import type { Config } from "@netlify/functions";

const ROUTES = [
  "/portal/api/cron/reconcile-stars",
  "/portal/api/cron/sync-tinysend",
  "/dashboard/api/cron/notify-submissions",
] as const;

export default async () => {
  const base = process.env.CRON_TARGET_URL || process.env.URL || "";
  const auth = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  const results: string[] = [];
  for (const path of ROUTES) {
    try {
      const res = await fetch(`${base}${path}`, { headers: { Authorization: auth } });
      results.push(`${path} -> ${res.status}`);
    } catch (e) {
      results.push(`${path} -> ERR ${(e as Error).message}`);
    }
  }
  return new Response(results.join("\n"), { status: 200 });
};

// Twice daily (08:00 & 20:00 UTC). Rare fallback only — do NOT increase frequency or
// you start re-defeating Neon's scale-to-zero.
export const config: Config = { schedule: "0 8,20 * * *" };
