import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { listApplications } from "@dashboard/lib/applications";
import { getCommentCounts, getUnreadFor } from "@dashboard/lib/comments";
import { getStars } from "@dashboard/lib/stars";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const h = await headers();
  const me = h.get("x-admin-user") ?? "admin";

  const [apps, unread, commentCounts, stars] = await Promise.all([
    listApplications(),
    getUnreadFor(me),
    getCommentCounts(),
    getStars(),
  ]);

  return NextResponse.json(
    {
      apps,
      unread,
      commentCounts,
      stars,
      me,
      fetchedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
