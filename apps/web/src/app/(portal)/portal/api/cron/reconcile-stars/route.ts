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

  const result = await runStarTrade();
  return Response.json(result);
}
