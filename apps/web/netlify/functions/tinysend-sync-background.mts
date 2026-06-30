// Netlify Background Function — drains unsynced applicants/signups into tinysend.
//
// Triggered (202, fire-and-forget) on user signup / application submit, and by
// the twice-daily cron-fallback. It loops the existing sync route (which imports
// up to 200 per call, idempotent against the ledger) until there's nothing left.
import type { Config } from "@netlify/functions";

const BATCH = 200;
const MAX_ITERATIONS = 50;

export default async (req: Request) => {
  const secret = process.env.CRON_SECRET ?? "";
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const base = process.env.URL || "";
  let imported = 0;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let res: Response;
    try {
      res = await fetch(`${base}/portal/api/cron/sync-tinysend`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
    } catch {
      break;
    }
    if (!res.ok) break;
    const data = (await res.json()) as { candidates?: number; imported?: number };
    imported += data.imported ?? 0;
    // A non-full batch means the ledger is drained.
    if (!data.candidates || data.candidates < BATCH) break;
  }

  return new Response(`tinysend sync done; imported=${imported}`);
};

export const config: Config = { background: true };
