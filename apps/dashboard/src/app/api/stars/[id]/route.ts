import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { addStar, removeStar } from "@/lib/stars";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function currentUser(): Promise<string | null> {
  const h = await headers();
  const u = h.get("x-admin-user");
  return u && u.length > 0 ? u : null;
}

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const me = await currentUser();
  if (!me) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await addStar(me, id);
  return NextResponse.json({ ok: true, starred: true });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const me = await currentUser();
  if (!me) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await removeStar(me, id);
  return NextResponse.json({ ok: true, starred: false });
}
