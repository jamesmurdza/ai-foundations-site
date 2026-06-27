import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getMentionNotifications } from "@dashboard/lib/comments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const h = await headers();
  const me = h.get("x-admin-user") ?? "admin";

  const notifications = await getMentionNotifications(me, 50);

  return NextResponse.json(
    { notifications, me, fetchedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
