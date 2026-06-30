import { runTinysendSync } from "@/lib/tinysend-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // one import POST + a few queries

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await runTinysendSync();
  return Response.json(result);
}
