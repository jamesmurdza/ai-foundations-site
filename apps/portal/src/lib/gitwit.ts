import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env";
import { GITWIT_CRITERIA, GITWIT_CRITERIA_IDS } from "./gitwitCriteria";
import type {
  CriterionVerdict,
  GitWitReview,
  ProfileSignals,
} from "./gitwitTypes";

// Re-export the client-safe types/helper so callers can keep importing from
// `@/lib/gitwit` (tests, server code). The UI imports from `./gitwitTypes`.
export type {
  CriterionVerdict,
  GitWitReview,
  ProfileSignals,
  VerdictWithLabel,
} from "./gitwitTypes";
export { partitionReview } from "./gitwitTypes";

/**
 * GitWit — a Haiku-powered review of a participant's GitHub profile + personal
 * README against the seven-point checklist in `gitwitCriteria.ts`.
 *
 * The model returns ONE verdict per criterion (met + a one-line note). The
 * "good" vs "still missing" split is then *derived* from those booleans — the
 * model is never asked "what should they fix?", so it can't invent a to-do list
 * when the profile already passes. A profile that meets all seven comes back as
 * seven met verdicts and an empty missing list, by construction.
 */

const MODEL = "claude-haiku-4-5";
const README_MAX = 12_000;

type RawVerdict = { id?: string; met?: boolean; note?: string };

function buildSystemPrompt(): string {
  const checklist = GITWIT_CRITERIA.map(
    (c, i) =>
      `${i + 1}. id="${c.id}" — ${c.label}\n   Counts as MET when: ${c.met}`,
  ).join("\n");

  return `You are GitWit, a friendly reviewer that checks a participant's GitHub profile and personal README against a fixed seven-point checklist for a coding program.

You are given the profile's metadata, the personal README (if any), the list of pinned repositories, and the profile avatar image (if any). For EACH of the seven criteria, decide whether it is already satisfied, and call the report_review tool exactly once with one verdict per criterion.

The seven criteria:
${checklist}

How to judge:
- Use ONLY the evidence provided. Do not assume anything that isn't shown.
- When a criterion is satisfied, set met=true and in "note" briefly name the evidence (e.g. "Lists TypeScript, React, and Go"). Keep it to one short, warm sentence.
- When a criterion is genuinely absent, set met=false and in "note" give ONE short, concrete suggestion for how to add it.
- For pinned_repos: having pinned repositories satisfies this on its own — they do NOT need to be mentioned in the README too. If they have pinned repos but one or more has no description, still set met=true and gently suggest adding short descriptions in the note.

Critical — do not manufacture work:
- Finding nothing to fix is a valid, good outcome. If the profile already satisfies a criterion, mark it met. Do NOT raise the bar, nitpick, or invent shortcomings just to produce a to-do.
- If all seven are satisfied, return all seven as met — that is success, not a failure to find problems.
- Equally, do not rubber-stamp: if something is truly missing, mark it not met plainly. Be honest in both directions.

Return exactly one verdict per criterion id, using the exact ids above.`;
}

const SYSTEM_PROMPT = buildSystemPrompt();

const REVIEW_TOOL: Anthropic.Tool = {
  name: "report_review",
  description:
    "Report the review: exactly one verdict per checklist criterion id.",
  // strict:true guarantees the shape; additionalProperties:false + all-required.
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      verdicts: {
        type: "array",
        description: "Exactly one entry per criterion id.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string", enum: [...GITWIT_CRITERIA_IDS] },
            met: { type: "boolean" },
            note: {
              type: "string",
              description:
                "One short sentence: the evidence if met, or a concrete suggestion if not.",
            },
          },
          required: ["id", "met", "note"],
        },
      },
    },
    required: ["verdicts"],
  },
};

function formatSignals(s: ProfileSignals): string {
  const readme =
    s.readmeMarkdown && s.readmeMarkdown.trim()
      ? s.readmeMarkdown.trim().slice(0, README_MAX)
      : "(no personal README found)";
  const pinned = s.pinnedRepos.length
    ? s.pinnedRepos
        .map((r) => `${r.name}${r.description ? ` — ${r.description}` : " — (no description)"}`)
        .join("; ")
    : "(none found)";

  return [
    `GitHub login: ${s.login}`,
    `Name: ${s.name ?? "(none)"}`,
    `Profile bio field: ${s.bio?.trim() ? s.bio.trim() : "(empty)"}`,
    `Website / blog: ${s.website ?? "(none)"}`,
    `LinkedIn: ${s.linkedin ?? "(none)"}`,
    `Twitter / X: ${s.twitter ?? "(none)"}`,
    `Avatar image: ${s.avatarUrl ? "attached above" : "(none provided)"}`,
    `Pinned repositories (${s.pinnedRepos.length}): ${pinned}`,
    "",
    "Personal README (raw markdown):",
    readme,
  ].join("\n");
}

/** Force the model's verdicts into exactly seven, canonical order, resilient. */
function normalize(raw: RawVerdict[] | undefined): CriterionVerdict[] {
  const byId = new Map<string, RawVerdict>();
  for (const v of raw ?? []) if (v && typeof v.id === "string") byId.set(v.id, v);

  return GITWIT_CRITERIA.map((c): CriterionVerdict => {
    const v = byId.get(c.id);
    if (v && typeof v.met === "boolean") {
      return { id: c.id, met: v.met, note: (v.note ?? "").trim() };
    }
    // Defensive: model dropped one — surface it as a gentle "add it to be safe".
    return {
      id: c.id,
      met: false,
      note: `Add this to be safe — ${c.label.toLowerCase()}.`,
    };
  });
}

/**
 * Review a profile against the checklist via Haiku. Pure in its inputs (takes
 * already-gathered `ProfileSignals`), so it can be exercised against sample
 * fixtures without touching GitHub or the database. Pass `opts.client` to inject
 * a client in tests.
 */
export async function reviewProfile(
  signals: ProfileSignals,
  opts?: { client?: Anthropic },
): Promise<GitWitReview> {
  const client = opts?.client ?? new Anthropic({ apiKey: env.anthropicApiKey });

  const content: Anthropic.ContentBlockParam[] = [];
  if (signals.avatarUrl) {
    content.push({
      type: "image",
      source: { type: "url", url: signals.avatarUrl },
    });
  }
  content.push({ type: "text", text: formatSignals(signals) });

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [REVIEW_TOOL],
    tool_choice: { type: "tool", name: REVIEW_TOOL.name },
    messages: [{ role: "user", content }],
  });

  const toolUse = message.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );
  const raw = (toolUse?.input ?? {}) as { verdicts?: RawVerdict[] };

  return { verdicts: normalize(raw.verdicts) };
}
