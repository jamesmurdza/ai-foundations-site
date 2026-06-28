import "server-only";
import { runStarTrade } from "./startrade";
import { runTinysendSync } from "./tinysend-sync";

// Event-driven triggers for the heavy reconcilers. On Netlify they kick off a
// 15-min *background function* (returns 202 instantly, no request latency); the
// background function then drains the whole backlog by looping the existing cron
// route in chunks. Off Netlify (local dev / Vercel) the function path isn't
// served, so we fall back to running the work inline — these are wrapped in
// `after()` at the call sites, so even the inline path is post-response.
const SECRET = process.env.CRON_SECRET ?? "";

function siteUrl(): string {
  return process.env.URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

async function triggerOrRun(name: string, fallback: () => Promise<unknown>): Promise<void> {
  try {
    const res = await fetch(`${siteUrl()}/.netlify/functions/${name}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SECRET}` },
    });
    if (res.status === 202) return; // accepted by Netlify's background runtime
  } catch {
    // not on Netlify (or unreachable) → run inline below
  }
  try {
    await fallback();
  } catch {
    // best-effort; the twice-daily cron-fallback backstops a missed run
  }
}

/** Reconcile Trade Stars for the whole portal (15-min bg fn on Netlify). */
export function triggerStarTrade(): Promise<void> {
  return triggerOrRun("star-trade-background", () => runStarTrade());
}

/** Drain unsynced applicants/signups into tinysend (bg fn on Netlify). */
export function triggerTinysendSync(): Promise<void> {
  return triggerOrRun("tinysend-sync-background", () => runTinysendSync());
}
