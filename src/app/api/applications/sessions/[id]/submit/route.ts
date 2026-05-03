import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: RouteCtx) {
  const rows = (await sql`
    SELECT status FROM hh_applications WHERE id = ${params.id} LIMIT 1
  `) as Record<string, unknown>[];
  if (rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (rows[0].status === "submitted") {
    return NextResponse.json({ error: "already_submitted" }, { status: 409 });
  }
  await sql`
    UPDATE hh_applications
       SET status = 'submitted',
           submitted_at = NOW(),
           updated_at = NOW()
     WHERE id = ${params.id}
  `;
  return NextResponse.json({ ok: true });
}
