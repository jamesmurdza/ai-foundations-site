/**
 * Fetch YouTube transcripts for a registered course and cache them as the raw
 * caption JSON the app serves. Pairs with clean-transcripts.ts:
 *
 *   npm run fetch:transcripts -w apps/web -- <courseSlug> [<courseSlug> ...]
 *   npm run clean:transcripts -w apps/web           # then clean them
 *
 * It reads the course from the registry (src/site/lib/courses), so the lesson
 * video IDs live in one place — you don't re-list them here. For each lesson
 * with a videoId (and not hasTranscript:false) it writes:
 *
 *   public/transcripts/<courseSlug>/video_<videoId>.json
 *
 * as a flat array of { text, start, duration } (seconds), matching what
 * Transcript.tsx and clean-transcripts.ts expect. The youtube-transcript
 * package returns offsets/durations in milliseconds — we convert to seconds.
 *
 * Flags:
 *   --force        re-download even if the file already exists
 *   --lang <code>  preferred caption language (e.g. en, es)
 *
 * Notes:
 *   - Only videos that actually have captions on YouTube can be fetched.
 *   - YouTube caption fetching can be rate-limited or blocked from some
 *     networks/CI; failures are reported per-video and don't abort the run.
 *   - This writes the RAW captions. Run clean:transcripts afterwards to add
 *     punctuation and remove filler words (it backs these up to .raw/ first).
 */
import { promises as fs } from "fs";
import path from "path";

import { YoutubeTranscript } from "youtube-transcript";

import { getCourse } from "@site/lib/courses";

interface Segment {
  text: string;
  start: number;
  duration: number;
}

const TRANSCRIPTS_DIR = path.resolve(process.cwd(), "public/transcripts");

// YouTube offsets/durations come as integer milliseconds; the served files use
// seconds at 2-decimal precision (10ms granularity — plenty for seek/highlight).
function toSeconds(ms: number): number {
  return Number((ms / 1000).toFixed(2));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const slugs: string[] = [];
  let force = false;
  let lang: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--force") force = true;
    else if (a === "--lang") lang = args[++i];
    else if (a === "--course") slugs.push(args[++i]);
    else if (a.startsWith("--")) throw new Error(`Unknown flag: ${a}`);
    else slugs.push(a);
  }
  return { slugs, force, lang };
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function fetchOne(
  videoId: string,
  lang: string | undefined,
): Promise<Segment[]> {
  const raw = await YoutubeTranscript.fetchTranscript(
    videoId,
    lang ? { lang } : undefined,
  );
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("empty transcript");
  }
  return raw.map((r) => ({
    text: r.text,
    start: toSeconds(r.offset),
    duration: toSeconds(r.duration),
  }));
}

async function main() {
  const { slugs, force, lang } = parseArgs();

  if (slugs.length === 0) {
    console.error(
      "Usage: npm run fetch:transcripts -w apps/web -- <courseSlug> [more slugs] [--force] [--lang en]",
    );
    process.exit(1);
  }

  let attempted = 0;
  let fetched = 0;
  let skipped = 0;
  const failures: { videoId: string; reason: string }[] = [];

  for (const slug of slugs) {
    const course = getCourse(slug);
    if (!course) {
      console.error(
        `✗ No registered course with slug "${slug}" (check src/site/lib/courses/index.ts)`,
      );
      failures.push({ videoId: `course:${slug}`, reason: "unknown course" });
      continue;
    }

    const dir = path.join(TRANSCRIPTS_DIR, slug);
    await fs.mkdir(dir, { recursive: true });

    console.log(`\n${slug}: ${course.lessons.length} lesson(s)`);
    for (const lesson of course.lessons) {
      if (!lesson.videoId) continue;
      if (lesson.hasTranscript === false) continue;

      const outPath = path.join(dir, `video_${lesson.videoId}.json`);
      if (!force && (await fileExists(outPath))) {
        skipped++;
        console.log(`  · ${lesson.videoId}: exists, skipping (use --force)`);
        continue;
      }

      attempted++;
      try {
        const segments = await fetchOne(lesson.videoId, lang);
        await fs.writeFile(
          outPath,
          JSON.stringify(segments, null, 2) + "\n",
          "utf8",
        );
        fetched++;
        console.log(`  ✓ ${lesson.videoId}: ${segments.length} segments`);
      } catch (e) {
        const reason = e instanceof Error ? e.message : String(e);
        failures.push({ videoId: lesson.videoId, reason });
        console.log(`  ✗ ${lesson.videoId}: ${reason}`);
      }
    }
  }

  console.log(
    `\nDone. fetched ${fetched}, skipped ${skipped}, failed ${failures.length} (of ${attempted} attempted).`,
  );
  if (failures.length > 0) {
    console.log(
      "Failures (no captions, disabled, wrong lang, or rate-limited):",
    );
    for (const f of failures) console.log(`  - ${f.videoId}: ${f.reason}`);
  }
  if (fetched > 0) {
    console.log(
      "\nNext: run `npm run clean:transcripts -w apps/web` to punctuate and de-filler the new files.",
    );
  }
  // Non-zero only if we tried and nothing succeeded.
  if (attempted > 0 && fetched === 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
