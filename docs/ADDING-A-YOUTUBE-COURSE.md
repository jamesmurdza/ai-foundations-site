# Adding a new YouTube course

This guide covers the end-to-end workflow for adding a course whose lessons are
YouTube videos: fetching transcripts from YouTube, cleaning them, wiring up the
transcript viewer, and defining the course itself.

All paths below are relative to `apps/web/`.

## The moving pieces

| Piece | Where | Purpose |
|---|---|---|
| Course definition | `src/site/lib/courses/<slug>.ts` | Title, lessons, video IDs, tabs, resources |
| Course registry | `src/site/lib/courses/index.ts` | Registers the course so routes resolve |
| Raw transcripts | `public/transcripts/<dir>/video_<videoId>.json` | Per-video caption data (served statically) |
| Transcript viewer | `src/site/components/Transcript.tsx` | Fetches + renders the transcript |
| Cleanup script | `src/portal/scripts/clean-transcripts.ts` | LLM pass: punctuation, remove filler words |
| Lesson markdown | `content/courses/<slug>/<lessonId>/*.md` | Long-form tab content (optional) |

Routes are `/(site)/courses/<courseSlug>/<lessonId>` — the lesson segment is the
lesson's `id`, not its title.

---

## Step 1 — Collect the YouTube video IDs

For each lesson, grab the 11-character video ID from its URL
(`https://www.youtube.com/watch?v=<VIDEO_ID>`). You'll use these both as the
lesson's `videoId` and as the transcript filename.

## Step 2 — Fetch the transcripts from YouTube

Transcripts are cached as static JSON files, one per video, at:

```
public/transcripts/<dir>/video_<videoId>.json
```

- `<dir>` is a folder for the course (existing ones: `ml-python`, `ai-agent-camp`).
  Use the course slug as the folder name for the new course.
- Each file is a **flat JSON array** of segment objects, exactly this shape:

```json
[
  { "text": "okay um hello everyone uh welcome to", "start": 2.08, "duration": 6.16 },
  { "text": "week three and today we are working on", "start": 5.72, "duration": 5.32 }
]
```

`start` and `duration` are seconds (floats). `text` may contain HTML entities
(e.g. `&#39;`) — the viewer decodes them. These are the raw YouTube auto-caption
fragments (short, lowercase, unpunctuated); Step 4 cleans them.

There is no in-repo fetcher — pull them with any tool that yields the schema
above. The simplest is the Python `youtube-transcript-api`:

```bash
pip install youtube-transcript-api
```

```python
# fetch_transcripts.py — run once, outside the app
import json, os
from youtube_transcript_api import YouTubeTranscriptApi

COURSE_DIR = "apps/web/public/transcripts/<slug>"   # e.g. ml-python
VIDEO_IDS  = ["uzKF08iaxu0", "OJTqB2wlvyA"]          # your lessons, in order

os.makedirs(COURSE_DIR, exist_ok=True)
for vid in VIDEO_IDS:
    segments = YouTubeTranscriptApi.get_transcript(vid)  # [{text,start,duration}, ...]
    with open(f"{COURSE_DIR}/video_{vid}.json", "w") as f:
        json.dump(segments, f, ensure_ascii=False, indent=2)
    print("saved", vid, len(segments), "segments")
```

`yt-dlp --write-auto-subs --sub-format json3` also works if you convert its
output to the `{text, start, duration}` shape. Only videos with captions
available on YouTube can be fetched.

> If a lesson's video has no captions, leave the file out and set
> `hasTranscript: false` on that lesson (Step 5) so the viewer isn't offered.

## Step 3 — Register the transcript directory in the viewer

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
const TRANSCRIPT_DIRS = ["ml-python", "ai-agent-camp", "<slug>"];
for (const dir of TRANSCRIPT_DIRS) {
  const res = await fetch(`/transcripts/${dir}/video_${videoId}.json`);
  if (res.ok) { setTranscript(await res.json()); setLoading(false); return; }
}
throw new Error("Transcript not available in cached files.");
```

Because filenames are keyed only by `videoId`, keep video IDs unique across
folders (they naturally are).

## Step 4 — Clean the transcripts with the LLM

Run the cleanup pass to add punctuation/capitalization and strip filler words
("um", "uh", "like", …):

```bash
npm run clean:transcripts -w apps/web
```

What it does (`src/portal/scripts/clean-transcripts.ts`):

- **Auto-discovers** every `public/transcripts/*/video_*.json` (any new course
  folder is picked up automatically — no code change needed).
- **Backs up** each raw original to `public/transcripts/<dir>/.raw/` the first
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
  script if you want higher-quality cleanup (e.g. `claude-sonnet-5`).

To re-clean later (e.g. after changing the prompt or model), just run it again —
it re-reads the pristine text from `.raw/`.

### Verify the clean pass didn't drift

Confirm segment count and timestamps are unchanged vs. the raw backup:

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

## Step 5 — Define the course

Create `src/site/lib/courses/<slug>.ts` following the shape in `types.ts`
(`Course` / `Lesson` / `LessonTab`). Use an existing course such as
`ml-python.ts` as a template.

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
      videoId: "VIDEO_ID",        // matches public/transcripts/my-course/video_VIDEO_ID.json
      duration: "1:15:00",
      // hasTranscript: false,    // set only if this video has no transcript
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

Then register it in `src/site/lib/courses/index.ts`:

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

## Step 6 — Verify

```bash
npm run typecheck -w apps/web
npm run dev -w apps/web           # then open /courses/<slug>/<lessonId>
```

Check in the browser that:

- The lesson video and thumbnail load.
- The **Transcript** tab shows clean, punctuated prose (not raw captions) — if it
  says "Transcript not available", you missed Step 3.
- Clicking a transcript chunk seeks the video, and the highlight tracks playback
  (proves timestamps survived cleaning).

## Quick checklist

- [ ] Video IDs collected
- [ ] `public/transcripts/<slug>/video_<id>.json` created for each lesson (raw)
- [ ] `<slug>` directory added to the fetch list in `Transcript.tsx` (Step 3)
- [ ] `npm run clean:transcripts` run; drift check passes; `.raw/` backups kept
- [ ] `src/site/lib/courses/<slug>.ts` created and registered in `index.ts`
- [ ] `npm run typecheck` passes; lesson pages verified in the browser
