import { runStarTrade } from "@portal/lib/startrade";

// One bounded, throttled star-reconciler drain per invocation. Vercel Cron pings
// this every few minutes (see vercel.json); each run stars up to
// MAX_WRITES_PER_RUN pairs and the rest resumes on the next run, so a portal-wide
// backfill spreads out safely under GitHub's rate limits.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  // Vercel Cron attaches `Authorization: Bearer ${CRON_SECRET}` automatically
  // when CRON_SECRET is set in the project env. Reject anything else.
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Optional per-call write cap so a single invocation finishes within Netlify's
  // short function timeout; the star-trade background function passes a small
  // value and loops until pendingRemaining hits 0 (Vercel can call it uncapped).
  const limitParam = Number(new URL(request.url).searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;

  const result = await runStarTrade(limit);
  return Response.json(result);
}
