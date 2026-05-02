import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { applicationStateSchema } from "@/lib/hacker-house/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = applicationStateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_state", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const s = parsed.data;

  await sql`
    INSERT INTO hh_applications (id, email, name, answers, step, status)
    VALUES (${s.sessionId}, ${s.email ?? null}, ${s.name ?? null}, ${JSON.stringify(s.answers)}::jsonb, ${s.step}, ${s.status})
    ON CONFLICT (id) DO NOTHING
  `;

  return NextResponse.json({ ok: true, sessionId: s.sessionId });
}
