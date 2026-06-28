// Netlify Background Function (15-min budget) — drains the Trade Stars backlog.
//
// Triggered (202, fire-and-forget) when a user activates auto-star / submits a
// repo, and by the twice-daily cron-fallback. It loops the existing reconcile
// route in small chunks (each chunk finishes within Netlify's short per-call
// function timeout) until pendingRemaining hits 0 or the time budget runs out.
// 100 stars × ~1.1s ≈ 110s — comfortably inside 15 min, so one run handles the
// whole backlog (no need to spawn more). The route is idempotent/resumable, so a
// truncated run just continues next trigger.
import type { Config } from "@netlify/functions";

const PER_CALL_LIMIT = Number(process.env.STAR_WRITES_PER_CALL || 6);
const MAX_ITERATIONS = 200;
const TIME_BUDGET_MS = 14 * 60 * 1000;

export default async (req: Request) => {
  const secret = process.env.CRON_SECRET ?? "";
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const base = process.env.URL || "";
  const started = Date.now();
  let remaining = Infinity;
  let iterations = 0;

  while (remaining > 0 && iterations < MAX_ITERATIONS && Date.now() - started < TIME_BUDGET_MS) {
    iterations++;
    let res: Response;
    try {
      res = await fetch(`${base}/portal/api/cron/reconcile-stars?limit=${PER_CALL_LIMIT}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
    } catch {
      break;
    }
    if (!res.ok) break;
    const data = (await res.json()) as { stars?: number; pendingRemaining?: number };
    remaining = typeof data.pendingRemaining === "number" ? data.pendingRemaining : 0;
    // No progress but work still pending → everything left is in a backoff window;
    // stop so we don't spin (the next trigger / cron retries once it's due).
    if ((data.stars ?? 0) === 0 && remaining > 0) break;
  }

  return new Response(`star-trade drained in ${iterations} chunk(s); remaining=${remaining}`);
};

export const config: Config = { background: true };
