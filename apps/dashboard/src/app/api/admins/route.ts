import { NextRequest, NextResponse } from "next/server";

import { createAdmin } from "@/lib/admins";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (typeof body.username !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const result = await createAdmin(body.username, body.password);
  if (!result.ok) {
    const status = result.error === "username_taken" ? 409 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json(result.admin, { status: 201 });
}
