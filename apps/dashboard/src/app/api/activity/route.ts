import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getActivity } from "@/lib/activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const h = await headers();
  const me = h.get("x-admin-user") ?? "admin";

  const events = await getActivity(60);

  return NextResponse.json(
    { events, me, fetchedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
