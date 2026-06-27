import { NextRequest, NextResponse } from "next/server";
import { deleteApplication, getApplication, updateAdminFields } from "@dashboard/lib/applications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set(["pending", "accepted", "rejected", "waitlist"]);

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const app = await getApplication(id);
  if (!app) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(app);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  let body: { adminStatus?: string; adminNotes?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const patch: { adminStatus?: "pending" | "accepted" | "rejected" | "waitlist"; adminNotes?: string | null } = {};

  if (body.adminStatus !== undefined) {
    if (!VALID_STATUSES.has(body.adminStatus)) {
      return NextResponse.json({ error: "invalid_admin_status" }, { status: 400 });
    }
    patch.adminStatus = body.adminStatus as typeof patch.adminStatus;
  }

  if (body.adminNotes !== undefined) {
    patch.adminNotes =
      typeof body.adminNotes === "string" ? body.adminNotes.slice(0, 5000) : null;
  }

  const next = await updateAdminFields(id, patch);
  if (!next) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(next);
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const ok = await deleteApplication(id);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
