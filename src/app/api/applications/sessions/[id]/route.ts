import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { applicationStateSchema } from "@/lib/hacker-house/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteCtx) {
  const rows = await sql`
    SELECT id, email, name, answers, dynamic_questions, status, why_text,
           project_text, portfolio_url, github_url, other_url, step,
           extract(epoch from updated_at)::bigint * 1000 AS updated_at
      FROM hh_applications
     WHERE id = ${params.id}
     LIMIT 1
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const r = rows[0];
  return NextResponse.json({
    sessionId: r.id,
    email: r.email ?? undefined,
    name: r.name ?? undefined,
    answers: r.answers ?? {},
    dynamicQuestions: r.dynamic_questions ?? undefined,
    status: r.status,
    whyText: r.why_text ?? undefined,
    projectText: r.project_text ?? undefined,
    portfolioUrl: r.portfolio_url ?? undefined,
    githubUrl: r.github_url ?? undefined,
    otherUrl: r.other_url ?? undefined,
    step: r.step ?? "intro",
    cardIndex: 0,
    updatedAt: Number(r.updated_at),
  });
}

export async function PATCH(req: NextRequest, { params }: RouteCtx) {
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

  if (s.sessionId !== params.id) {
    return NextResponse.json({ error: "id_mismatch" }, { status: 400 });
  }

  const existing = await sql`
    SELECT status FROM hh_applications WHERE id = ${params.id} LIMIT 1
  `;

  if (existing.length === 0) {
    await sql`
      INSERT INTO hh_applications (
        id, email, name, answers, dynamic_questions, status,
        why_text, project_text, portfolio_url, github_url, other_url, step
      ) VALUES (
        ${s.sessionId},
        ${s.email ?? null},
        ${s.name ?? null},
        ${JSON.stringify(s.answers)}::jsonb,
        ${s.dynamicQuestions ? JSON.stringify(s.dynamicQuestions) : null}::jsonb,
        ${s.status},
        ${s.whyText ?? null},
        ${s.projectText ?? null},
        ${s.portfolioUrl ?? null},
        ${s.githubUrl ?? null},
        ${s.otherUrl ?? null},
        ${s.step}
      )
    `;
    return NextResponse.json({ ok: true, created: true });
  }

  if (existing[0].status === "submitted") {
    return NextResponse.json({ ok: true, frozen: true });
  }

  await sql`
    UPDATE hh_applications SET
      email             = ${s.email ?? null},
      name              = ${s.name ?? null},
      answers           = ${JSON.stringify(s.answers)}::jsonb,
      dynamic_questions = ${s.dynamicQuestions ? JSON.stringify(s.dynamicQuestions) : null}::jsonb,
      why_text          = ${s.whyText ?? null},
      project_text      = ${s.projectText ?? null},
      portfolio_url     = ${s.portfolioUrl ?? null},
      github_url        = ${s.githubUrl ?? null},
      other_url         = ${s.otherUrl ?? null},
      step              = ${s.step},
      updated_at        = NOW()
    WHERE id = ${params.id}
  `;

  return NextResponse.json({ ok: true });
}
