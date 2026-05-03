import { NextRequest, NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { sql } from "@/lib/db";
import { anthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { STATIC_QUESTIONS, getVisibleQuestions } from "@/lib/hacker-house/questions";
import { dynamicQuestionsResponseSchema } from "@/lib/hacker-house/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type RouteCtx = { params: { id: string } };

const SYSTEM_PROMPT = `You are an admissions interviewer for a 4-week summer program where builders work on their portfolios together in Southeast Asia.

You will be given a candidate's answers about their background, projects, motivations, and what they'd like to teach. Generate exactly 2 follow-up questions.

Question 1 (id: q-dyn-1): About their PROJECTS
- Dig into what they've actually built or want to build
- Ask for specifics, examples, or what excited them about a project
- Reference their answer to "What kind of projects do you like to build?"

Question 2 (id: q-dyn-2): About their MOTIVATION or INTERESTS
- Dig into why they care about what they do
- Connect their motivation answer to what they want to teach or learn
- Reference their answers to "What motivates you most?" and "What would you like to teach others?"

Both questions should:
- Be open-ended text responses (not multiple choice)
- Be specific to *this* candidate (reference their actual answers)
- Be conversational and warm
- Be under 140 characters

Return via the generate_followups tool only.`;

const TOOL: Anthropic.Tool = {
  name: "generate_followups",
  description:
    "Return 2 follow-up text questions tailored to the candidate.",
  input_schema: {
    type: "object",
    properties: {
      questions: {
        type: "array",
        minItems: 2,
        maxItems: 2,
        items: {
          type: "object",
          required: ["id", "question", "type", "probes"],
          properties: {
            id: { type: "string", description: "q-dyn-1 or q-dyn-2" },
            question: { type: "string" },
            type: { type: "string", enum: ["text"], default: "text" },
            probes: {
              type: "string",
              description: "Internal: which prior answer this probes",
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

  const rows = (await sql`
    SELECT answers, dynamic_questions, status
      FROM hh_applications
     WHERE id = ${params.id}
     LIMIT 1
  `) as Record<string, unknown>[];
  if (rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const row = rows[0];

  if (row.dynamic_questions) {
    return NextResponse.json({ questions: row.dynamic_questions, cached: true });
  }

  const dbAnswers = (row.answers ?? {}) as Record<string, string>;
  const answers: Record<string, string> = { ...dbAnswers, ...(bodyAnswers ?? {}) };

  // Check that all visible questions are answered
  const visibleQuestions = getVisibleQuestions(answers);
  const answered = visibleQuestions.filter((q) => answers[q.id]).length;
  if (answered < visibleQuestions.length) {
    return NextResponse.json(
      { error: "incomplete_static", answered, expected: visibleQuestions.length },
      { status: 400 },
    );
  }

  const summary = buildAnswerSummary(answers);

  let response;
  try {
    response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 1024,
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
          content: `Here are the candidate's answers:\n\n${summary}\n\nGenerate 2 follow-up questions via the generate_followups tool.`,
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
