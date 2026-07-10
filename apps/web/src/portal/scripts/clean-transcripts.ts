/**
 * One-off: clean up the raw YouTube auto-caption transcripts under
 * public/transcripts/ so they read well in the transcript viewer — add
 * punctuation/capitalization, remove filler words ("um", "uh", "like", ...),
 * and fix obvious transcription slips. Uses Claude (Haiku) once per batch.
 *
 *   npm run clean:transcripts -w apps/web
 *   # or, with the key already in the environment:
 *   node --import tsx src/portal/scripts/clean-transcripts.ts
 *
 * Reads ANTHROPIC key from HH_ANTHROPIC_API_KEY || ANTHROPIC_API_KEY (see
 * src/site/lib/anthropic.ts). Optional flags:
 *   --file <name>   only process files whose path includes <name>
 *   --limit <n>     only process the first <n> files
 *   --dry           don't write cleaned output (still calls the LLM)
 *
 * Design guarantees (the viewer depends on these):
 *   - The segment array length is preserved 1:1.
 *   - Every `start` and `duration` is left untouched; only `text` is rewritten.
 *   - Raw originals are backed up to <dir>/.raw/ and cleaning always reads from
 *     that backup, so the script is idempotent and re-runnable.
 */
import { promises as fs } from "fs";
import path from "path";

import { anthropic, HAIKU_MODEL } from "@site/lib/anthropic";

interface Segment {
  text: string;
  duration: number;
  start: number;
  lang?: string;
}

const TRANSCRIPTS_DIR = path.resolve(
  process.cwd(),
  "public/transcripts",
);
const BATCH_SIZE = 60;
const CONCURRENCY = 4;
const MAX_RETRIES = 1;

// Mirror of decodeHTMLEntities() in src/site/components/Transcript.tsx.
function decodeHTMLEntities(text: unknown): string {
  if (!text) return "";
  return String(text)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'");
}

const SYSTEM_PROMPT = `You clean raw machine-generated video caption fragments from a spoken lecture into readable prose.

You are given N numbered fragments (in order). Clean them:
- Add proper capitalization and punctuation. A single sentence usually spans several fragments, so punctuate across them (capitalize a sentence's first word, end it with a period/question mark in whichever fragment it finishes).
- Delete filler words and verbal tics: "um", "uh", "erm", filler "like", "you know", filler "sort of"/"kind of", "I mean", filler "basically", "right?", stutters, false starts, and accidental duplicate words.
- Fix obvious transcription errors. Preserve bracketed cues like [Music], [Applause] unchanged.

Output format: a JSON array "segments" of objects { "i": <original fragment number, 1..N>, "text": <cleaned text> }.
- Assign each piece of cleaned text to the fragment number "i" it belongs to (its original position). Keep the words of fragment i attached to i whenever possible, so text stays close to its timestamp.
- Prefer one output object per input fragment. When you combine several fragments' words into one sentence chunk, attach that text to the EARLIEST of those fragment numbers and simply omit the others (they become empty) — do NOT renumber or shift the later fragments.
- Do NOT paraphrase, summarize, add, or drop actual content; only clean it. Never reorder. "i" always refers to the original numbering.
- Return only the structured output, no commentary.`;

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    segments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          i: { type: "integer" },
          text: { type: "string" },
        },
        required: ["i", "text"],
        additionalProperties: false,
      },
    },
  },
  required: ["segments"],
  additionalProperties: false,
} as const;

interface Usage {
  input: number;
  output: number;
}

async function cleanBatch(
  texts: string[],
  usage: Usage,
): Promise<string[] | null> {
  const numbered = texts
    .map((t, i) => `${i + 1}. ${t.replace(/\s+/g, " ").trim()}`)
    .join("\n");

  const userMessage = `Here are ${texts.length} caption fragments to clean. Return exactly ${texts.length} cleaned fragments.\n\n${numbered}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
      // Structured output — guarantees a parseable { segments: string[] }.
      output_config: {
        format: { type: "json_schema", schema: OUTPUT_SCHEMA },
      },
    } as Parameters<typeof anthropic.messages.create>[0]);

    usage.input += response.usage.input_tokens;
    usage.output += response.usage.output_tokens;

    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") continue;

    let parsed: { segments?: unknown };
    try {
      parsed = JSON.parse(block.text);
    } catch {
      continue;
    }

    const segments = parsed.segments;
    if (!Array.isArray(segments) || segments.length === 0) continue;

    // Place each index-keyed piece into its original slot. Fragments the model
    // merged away stay empty — this keeps the output aligned 1:1 with the input
    // (and every timestamp) no matter how the model combined sentences.
    const out = new Array<string>(texts.length).fill("");
    let placed = 0;
    for (const seg of segments) {
      if (
        seg &&
        typeof seg === "object" &&
        typeof (seg as { i?: unknown }).i === "number" &&
        typeof (seg as { text?: unknown }).text === "string"
      ) {
        const idx = (seg as { i: number }).i - 1;
        if (idx >= 0 && idx < texts.length) {
          out[idx] = (seg as { text: string }).text;
          placed++;
        }
      }
    }
    if (placed > 0) return out;
    // Nothing usable — retry once, then give up on this batch.
  }

  return null;
}

// Minimal concurrency pool.
async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

async function processFile(
  filePath: string,
  usage: Usage,
  dry: boolean,
): Promise<void> {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const rawDir = path.join(dir, ".raw");
  const rawPath = path.join(rawDir, base);

  // Back up the raw original once; always clean FROM the raw backup.
  await fs.mkdir(rawDir, { recursive: true });
  try {
    await fs.access(rawPath);
  } catch {
    await fs.copyFile(filePath, rawPath);
  }

  const raw = await fs.readFile(rawPath, "utf8");
  const segments: Segment[] = JSON.parse(raw);
  const decoded = segments.map((s) => decodeHTMLEntities(s.text));

  // Chunk into batches.
  const batches: { start: number; texts: string[] }[] = [];
  for (let i = 0; i < decoded.length; i += BATCH_SIZE) {
    batches.push({ start: i, texts: decoded.slice(i, i + BATCH_SIZE) });
  }

  let fallbacks = 0;
  const cleanedBatches = await mapPool(batches, CONCURRENCY, async (batch) => {
    const cleaned = await cleanBatch(batch.texts, usage);
    if (!cleaned) {
      fallbacks++;
      return batch.texts; // keep raw (decoded) text for this batch
    }
    return cleaned;
  });

  const cleanedTexts = cleanedBatches.flat();
  if (cleanedTexts.length !== segments.length) {
    throw new Error(
      `Segment count drift in ${base}: ${cleanedTexts.length} !== ${segments.length}`,
    );
  }

  // Rebuild: keep start/duration, replace text only.
  const output: Segment[] = segments.map((s, i) => ({
    ...s,
    text: cleanedTexts[i],
  }));

  const label = `${path.basename(dir)}/${base}`;
  if (dry) {
    console.log(
      `  [dry] ${label}: ${segments.length} segments, ${batches.length} batches, ${fallbacks} fallback(s) — not written`,
    );
    return;
  }

  await fs.writeFile(filePath, JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(
    `  ✓ ${label}: ${segments.length} segments, ${batches.length} batches` +
      (fallbacks ? `, ${fallbacks} batch fallback(s) kept raw` : ""),
  );
}

async function findTranscriptFiles(): Promise<string[]> {
  const out: string[] = [];
  const subdirs = await fs.readdir(TRANSCRIPTS_DIR, { withFileTypes: true });
  for (const sub of subdirs) {
    if (!sub.isDirectory() || sub.name === ".raw") continue;
    const subPath = path.join(TRANSCRIPTS_DIR, sub.name);
    const files = await fs.readdir(subPath);
    for (const f of files) {
      if (f.startsWith("video_") && f.endsWith(".json")) {
        out.push(path.join(subPath, f));
      }
    }
  }
  return out.sort();
}

function parseArgs() {
  const args = process.argv.slice(2);
  let file: string | undefined;
  let limit: number | undefined;
  let dry = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--file") file = args[++i];
    else if (args[i] === "--limit") limit = Number(args[++i]);
    else if (args[i] === "--dry") dry = true;
  }
  return { file, limit, dry };
}

async function main() {
  const { file, limit, dry } = parseArgs();

  let files = await findTranscriptFiles();
  if (file) files = files.filter((f) => f.includes(file));
  if (limit != null) files = files.slice(0, limit);

  if (files.length === 0) {
    console.log("No transcript files matched.");
    return;
  }

  console.log(
    `Cleaning ${files.length} transcript file(s) with ${HAIKU_MODEL}${dry ? " (dry run)" : ""}...`,
  );
  const usage: Usage = { input: 0, output: 0 };

  for (const f of files) {
    await processFile(f, usage, dry);
  }

  // Haiku 4.5 pricing: $1 / 1M input, $5 / 1M output.
  const cost = (usage.input / 1e6) * 1 + (usage.output / 1e6) * 5;
  console.log(
    `\nDone. Tokens — input: ${usage.input.toLocaleString()}, output: ${usage.output.toLocaleString()}. Approx cost: $${cost.toFixed(3)}.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
