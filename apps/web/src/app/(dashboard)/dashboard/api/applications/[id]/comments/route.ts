import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { getApplication } from "@dashboard/lib/applications";
import { addComment, listComments, markVisited } from "@dashboard/lib/comments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function adminUser(): Promise<string | null> {
  const h = await headers();
  return h.get("x-admin-user");
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const app = await getApplication(id);
  if (!app) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const me = await adminUser();
  const comments = await listComments(id);
  if (me) {
    void markVisited(me, id);
  }
  return NextResponse.json({ comments });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const me = await adminUser();
  if (!me) return NextResponse.json({ error: "no_user" }, { status: 401 });

  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.body || typeof body.body !== "string" || !body.body.trim()) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const app = await getApplication(id);
  if (!app) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const created = await addComment(id, me, body.body);
  await markVisited(me, id);
  return NextResponse.json(created);
}
