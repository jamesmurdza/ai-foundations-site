import { NextRequest, NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { sql } from "@/lib/db";
import { anthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { STATIC_COUNT, STATIC_QUESTIONS } from "@/lib/hacker-house/questions";
import { dynamicQuestionsResponseSchema } from "@/lib/hacker-house/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type RouteCtx = { params: { id: string } };

const SYSTEM_PROMPT = `You are an admissions interviewer for a competitive 4-week intensive program where 6 builders from around the world (college students especially welcome, but not required) build their portfolios full-time. The program selects for: real builder energy, eagerness to learn, growth mindset, and willingness to ship hard things in a collaborative environment.

You will be given a candidate's multiple-choice answers (about 15-20 questions covering personality, work style, commitment, and logistics). Generate exactly 5 follow-up multiple-choice questions that probe DEEPER, not BROADER. Each question should:
- Surface a contradiction, tension, or unexamined claim in their answers
- Be specific to *this* candidate's profile (not generic)
- Have 4 options of similar plausibility, no obvious "right" answer
- Be conversational and warm in tone (not corporate)
- Avoid demographic content (gender, race, religion, age)
- Avoid asking "why do you want to apply" — that's covered separately

Use ids q-dyn-1 through q-dyn-5. Keep each question under 140 characters and each option under 80 characters. Return via the generate_followups tool only.`;

const TOOL: Anthropic.Tool = {
  name: "generate_followups",
  description:
    "Return 5 follow-up multiple-choice questions tailored to the candidate.",
  input_schema: {
    type: "object",
    properties: {
      questions: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: {
          type: "object",
          required: ["id", "question", "options", "probes"],
          properties: {
            id: { type: "string", description: "q-dyn-1 .. q-dyn-5" },
            question: { type: "string" },
            options: {
              type: "array",
              minItems: 4,
              maxItems: 4,
              items: { type: "string" },
            },
            probes: {
              type: "string",
              description: "Internal: which prior answer or tension this probes",
            },
          },
        },
      },
    },
    required: ["questions"],
  },
};

function buildAnswerSummary(answers: Record<string, string>): string {
  const lines: string[] = [];
  for (const q of STATIC_QUESTIONS) {
    const a = answers[q.id];
    if (!a) continue;
    lines.push(`Q: ${q.prompt}`);
    lines.push(`A: ${a}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}

export async function POST(req: NextRequest, { params }: RouteCtx) {
  let bodyAnswers: Record<string, string> | undefined;
  try {
    const body = (await req.json()) as { answers?: Record<string, string> | null };
    if (body?.answers && typeof body.answers === "object") {
      bodyAnswers = body.answers;
    }
  } catch {
    /* body optional */
  }

  const rows = await sql`
    SELECT answers, dynamic_questions, status
      FROM hh_applications
     WHERE id = ${params.id}
     LIMIT 1
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const row = rows[0];

  if (row.dynamic_questions) {
    return NextResponse.json({ questions: row.dynamic_questions, cached: true });
  }

  const dbAnswers = (row.answers ?? {}) as Record<string, string>;
  const answers: Record<string, string> = { ...dbAnswers, ...(bodyAnswers ?? {}) };
  const answered = STATIC_QUESTIONS.filter((q) => answers[q.id]).length;
  if (answered < STATIC_COUNT) {
    return NextResponse.json(
      { error: "incomplete_static", answered, expected: STATIC_COUNT },
      { status: 400 },
    );
  }

  const summary = buildAnswerSummary(answers);

  let response;
  try {
    response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 2048,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [TOOL],
      tool_choice: { type: "tool", name: "generate_followups" },
      messages: [
        {
          role: "user",
          content: `Here are the candidate's 15 answers:\n\n${summary}\n\nGenerate 5 follow-up questions via the generate_followups tool.`,
        },
      ],
    });
  } catch (err) {
    console.error("anthropic error", err);
    return NextResponse.json(
      { error: "anthropic_failed" },
      { status: 502 },
    );
  }

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return NextResponse.json(
      { error: "no_tool_use" },
      { status: 502 },
    );
  }

  const parsed = dynamicQuestionsResponseSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    console.error("schema validation failed", parsed.error.issues, toolUse.input);
    return NextResponse.json(
      { error: "schema_invalid", issues: parsed.error.issues },
      { status: 502 },
    );
  }

  const questions = parsed.data.questions;

  if (bodyAnswers) {
    await sql`
      UPDATE hh_applications
         SET dynamic_questions = ${JSON.stringify(questions)}::jsonb,
             answers           = ${JSON.stringify(answers)}::jsonb,
             updated_at        = NOW()
       WHERE id = ${params.id}
    `;
  } else {
    await sql`
      UPDATE hh_applications
         SET dynamic_questions = ${JSON.stringify(questions)}::jsonb,
             updated_at        = NOW()
       WHERE id = ${params.id}
    `;
  }

  return NextResponse.json({ questions, cached: false });
}
