# Adding a new YouTube course

This guide covers the end-to-end workflow for adding a course whose lessons are
YouTube videos: defining the course, fetching transcripts from YouTube, cleaning
them, and wiring up the transcript viewer.

All paths below are relative to `apps/web/`.

## The moving pieces

| Piece | Where | Purpose |
|---|---|---|
| Course definition | `src/site/lib/courses/<slug>.ts` | Title, lessons, video IDs, tabs, resources |
| Course registry | `src/site/lib/courses/index.ts` | Registers the course so routes + the fetcher resolve it |
| Fetch script | `src/portal/scripts/fetch-transcripts.ts` | Downloads raw captions from YouTube (`npm run fetch:transcripts`) |
| Raw transcripts | `public/transcripts/<slug>/video_<videoId>.json` | Per-video caption data (served statically) |
| Cleanup script | `src/portal/scripts/clean-transcripts.ts` | LLM pass: punctuation, remove filler words (`npm run clean:transcripts`) |
| Transcript viewer | `src/site/components/Transcript.tsx` | Fetches + renders the transcript |
| Lesson markdown | `content/courses/<slug>/<lessonId>/*.md` | Long-form tab content (optional) |

Routes are `/(site)/courses/<courseSlug>/<lessonId>` — the lesson segment is the
lesson's `id`, not its title. The transcript **folder name is the course slug**.

The pipeline is: **define the course → `fetch:transcripts` → `clean:transcripts`
→ register the folder in the viewer**. The fetch script reads video IDs from the
registered course, so the course must be defined first.

---

## Step 1 — Define & register the course

Create `src/site/lib/courses/<slug>.ts` following the shape in `types.ts`
(`Course` / `Lesson` / `LessonTab`). Use an existing course such as
`ml-python.ts` as a template. Grab each 11-char video ID from its YouTube URL
(`…/watch?v=<VIDEO_ID>`).

```ts
import type { Course } from "./types";

export const myCourse: Course = {
  slug: "my-course",              // URL segment + transcript folder name
  title: "My Course",
  description: "…",
  metaTitle: "…",                 // optional SEO overrides
  metaDescription: "…",
  resources: [                    // course-wide links (github/colab/apply/link)
    { type: "github", label: "Course Materials", href: "https://…" },
  ],
  lessons: [
    {
      id: "1",                    // URL segment: /courses/my-course/1
      title: "Lesson One",
      summary: "…",
      videoId: "VIDEO_ID",        // -> public/transcripts/my-course/video_VIDEO_ID.json
      duration: "1:15:00",
      // hasTranscript: false,    // set only if this video has no captions
      tabs: [
        { type: "about", content: "Short intro shown on the About tab." },
        { type: "material" },     // renders lesson + course resources
        { type: "transcript" },   // renders the cleaned transcript
      ],
    },
    // …more lessons
  ],
};
```

Register it in `src/site/lib/courses/index.ts`:

```ts
import { myCourse } from "./my-course";
const COURSES: Course[] = [aiAgentCamp, mlPython, minecraftAi, myCourse];
```

Tab notes (see the comment in `types.ts`):

- `type: "material"` → renders the lesson/course resources; `type: "transcript"`
  → renders the transcript; any other `type` (e.g. `"about"`, `"notes"`) renders
  markdown.
- Markdown content can be inline via `content`, or read from
  `content/courses/<slug>/<lessonId>/<file ?? `${type}.md`>`. `content` wins when
  both are present.
- `videoId` drives the thumbnail (`youtubeThumbnail`) and whether a transcript is
  offered (`lessonHasTranscript` returns true when `videoId` is set unless
  `hasTranscript` is explicitly `false`).

## Step 2 — Fetch the transcripts from YouTube

Run the fetch script with the course slug(s). It reads the lesson video IDs from
the course you just registered and downloads each transcript:

```bash
npm run fetch:transcripts -w apps/web -- my-course
```

What it does (`src/portal/scripts/fetch-transcripts.ts`):

- For every lesson with a `videoId` (and not `hasTranscript: false`), downloads
  the captions (via the `youtube-transcript` package) and writes
  `public/transcripts/<slug>/video_<videoId>.json` — a flat array of
  `{ text, start, duration }` (seconds), the exact shape the viewer and the clean
  script expect. YouTube returns milliseconds; the script converts to seconds.
- **Skips** files that already exist (pass `--force` to re-download).
- Reports per-video success/failure and never aborts the whole run on one bad
  video.

Flags:

```bash
npm run fetch:transcripts -w apps/web -- my-course --force      # re-download existing
npm run fetch:transcripts -w apps/web -- my-course --lang en    # preferred caption language
npm run fetch:transcripts -w apps/web -- course-a course-b      # multiple courses
```

Caveats:

- Only videos that actually have captions on YouTube can be fetched. For a video
  with no captions, set `hasTranscript: false` on the lesson so the viewer isn't
  offered — the script skips it too.
- YouTube caption fetching can be rate-limited or blocked from some networks/CI;
  failed videos are listed at the end. Re-run to pick up the stragglers (existing
  files are skipped).
- This writes the **raw** captions (lowercase, unpunctuated, full of filler).
  Step 3 cleans them.

> No network access, or need a language YouTube doesn't expose here? You can also
> produce the same `{text, start, duration}` files by hand (or with
> `youtube-transcript-api` / `yt-dlp`) and drop them in
> `public/transcripts/<slug>/`. The clean step doesn't care how they got there.

## Step 3 — Clean the transcripts with the LLM

Add punctuation/capitalization and strip filler words ("um", "uh", "like", …):

```bash
npm run clean:transcripts -w apps/web
```

What it does (`src/portal/scripts/clean-transcripts.ts`):

- **Auto-discovers** every `public/transcripts/*/video_*.json` (your new course
  folder is picked up automatically — no code change needed).
- **Backs up** each raw original to `public/transcripts/<slug>/.raw/` the first
  time, and always cleans **from** that backup — so it's idempotent and
  re-runnable, and never double-cleans. Keep the `.raw/` backups in git.
- **Preserves timestamps exactly.** The segment array length and every
  `start`/`duration` are untouched — only `text` is rewritten. It does this by
  asking the model for index-keyed `{ i, text }` pieces and placing each back in
  its original slot; when the model merges fragments into one sentence, that text
  attaches to the earliest fragment and the others become empty strings. This is
  what keeps click-to-seek and the active-segment highlight working.

Useful flags (run from `apps/web/`):

```bash
node --import tsx src/portal/scripts/clean-transcripts.ts --file <videoId>   # one file
node --import tsx src/portal/scripts/clean-transcripts.ts --limit 1          # first file only
node --import tsx src/portal/scripts/clean-transcripts.ts --dry              # call the LLM but don't write
```

Requirements & cost:

- Needs an Anthropic key in the environment: `HH_ANTHROPIC_API_KEY` (or
  `ANTHROPIC_API_KEY`). The `npm run` form loads it from `apps/web/.env.local`;
  if the var is already exported you can run the `node --import tsx …` form
  directly.
- Model is `claude-haiku-4-5` (`HAIKU_MODEL` from `src/site/lib/anthropic.ts`).
  ~10 hour-long lectures cost roughly **$1.5–2** total. Swap the model in the
  script for higher-quality cleanup (e.g. `claude-sonnet-5`).

To re-clean later (e.g. after changing the prompt or model), just run it again —
it re-reads the pristine text from `.raw/`.

## Step 4 — Register the transcript directory in the viewer

**This is easy to miss.** `Transcript.tsx` does **not** derive the folder from the
course slug — it fetches from a hardcoded list of directories, trying each in
order until one returns the file. Today it only tries `ml-python` and
`ai-agent-camp`:

```ts
// src/site/components/Transcript.tsx — loadTranscript()
const mlPythonRes = await fetch(`/transcripts/ml-python/video_${videoId}.json`);
// ...falls back to:
const aiAgentRes  = await fetch(`/transcripts/ai-agent-camp/video_${videoId}.json`);
```

When you add a course with its own transcript folder, add a fetch for it here
(or the viewer will report "Transcript not available"). Prefer refactoring the
per-directory `fetch` calls into a loop over a `TRANSCRIPT_DIRS` array so future
courses only need one line:

```ts
const TRANSCRIPT_DIRS = ["ml-python", "ai-agent-camp", "my-course"];
for (const dir of TRANSCRIPT_DIRS) {
  const res = await fetch(`/transcripts/${dir}/video_${videoId}.json`);
  if (res.ok) { setTranscript(await res.json()); setLoading(false); return; }
}
throw new Error("Transcript not available in cached files.");
```

Because filenames are keyed only by `videoId`, keep video IDs unique across
folders (they naturally are).

## Step 5 — Verify

```bash
npm run typecheck -w apps/web
npm run dev -w apps/web           # then open /courses/<slug>/<lessonId>
```

Check in the browser that:

- The lesson video and thumbnail load.
- The **Transcript** tab shows clean, punctuated prose (not raw captions) — if it
  says "Transcript not available", you missed Step 4.
- Clicking a transcript chunk seeks the video, and the highlight tracks playback
  (proves timestamps survived cleaning).

Confirm the clean pass didn't drift (segment count + timestamps unchanged vs. the
raw backup):

```bash
node --import tsx -e '
import { promises as fs } from "fs"; import path from "path";
const base="apps/web/public/transcripts";
for (const sub of await fs.readdir(base)) {
  const dir=path.join(base,sub); if(!(await fs.stat(dir)).isDirectory()) continue;
  for (const f of await fs.readdir(dir)) {
    if(!f.startsWith("video_")||!f.endsWith(".json")) continue;
    const raw=JSON.parse(await fs.readFile(path.join(dir,".raw",f),"utf8"));
    const cl=JSON.parse(await fs.readFile(path.join(dir,f),"utf8"));
    let drift=0; for(let i=0;i<raw.length;i++) if(raw[i].start!==cl[i].start||raw[i].duration!==cl[i].duration) drift++;
    console.log((raw.length===cl.length&&drift===0?"OK ":"BAD "),`${sub}/${f}`);
  }
}'
```

## Quick checklist

- [ ] `src/site/lib/courses/<slug>.ts` created (with lesson `videoId`s) and
      registered in `index.ts`
- [ ] `npm run fetch:transcripts -- <slug>` run; raw files landed in
      `public/transcripts/<slug>/`
- [ ] `npm run clean:transcripts` run; drift check passes; `.raw/` backups kept
- [ ] `<slug>` directory added to the fetch list in `Transcript.tsx` (Step 4)
- [ ] `npm run typecheck` passes; lesson pages verified in the browser

## Reference — transcript JSON schema

```json
[
  { "text": "welcome to week three", "start": 5.72, "duration": 5.32 }
]
```

`start`/`duration` in seconds; one file per video at
`public/transcripts/<slug>/video_<videoId>.json`, with the pristine pre-clean
copy at `public/transcripts/<slug>/.raw/video_<videoId>.json`.
