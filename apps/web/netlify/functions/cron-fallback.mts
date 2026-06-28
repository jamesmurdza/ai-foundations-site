// Netlify Scheduled Function — twice-daily fallback (the rare safety net).
//
// Real-time work is event-driven: activations/signups fire-and-forget a 202 to the
// background functions, which self-drain in their 15-min budget. This scheduled run
// (08:00 & 20:00 UTC) just re-kicks those background functions to catch anything the
// instant triggers missed, plus drains the bounded notify backlog. Keeping it rare
// lets Neon scale to zero the rest of the day. Do NOT increase the frequency.
import type { Config } from "@netlify/functions";

export default async () => {
  const base = process.env.URL || "";
  const auth = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  const results: string[] = [];

  // The two heavy reconcilers need the 15-min budget → invoke them as background
  // functions (each loops its route in chunks until drained). Calling those routes
  // directly here would be killed by Netlify's short scheduled-function timeout.
  for (const fn of ["star-trade-background", "tinysend-sync-background"]) {
    try {
      const res = await fetch(`${base}/.netlify/functions/${fn}`, {
        method: "POST",
        headers: { Authorization: auth },
      });
      results.push(`${fn} -> ${res.status}`);
    } catch (e) {
      results.push(`${fn} -> ERR ${(e as Error).message}`);
    }
  }

  // Notify-submissions is bounded (≤50 emails) and resumable — call it directly.
  try {
    const res = await fetch(`${base}/dashboard/api/cron/notify-submissions`, {
      headers: { Authorization: auth },
    });
    results.push(`notify-submissions -> ${res.status}`);
  } catch (e) {
    results.push(`notify-submissions -> ERR ${(e as Error).message}`);
  }

  return new Response(results.join("\n"), { status: 200 });
};

export const config: Config = { schedule: "0 8,20 * * *" };
