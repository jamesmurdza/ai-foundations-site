# Transcripts

Cached YouTube caption data, one JSON file per video:

```
<courseDir>/video_<videoId>.json   # cleaned, served to the app
<courseDir>/.raw/video_<videoId>.json   # pristine raw backup (do not edit)
```

Each file is a flat array of `{ "text": string, "start": number, "duration": number }`
segments (seconds). The `.raw/` copies are the untouched YouTube captions; the
top-level files are the LLM-cleaned versions.

These are produced by two scripts (from `apps/web/`):

```
npm run fetch:transcripts -w apps/web -- <courseSlug>   # download raw captions from YouTube
npm run clean:transcripts -w apps/web                   # punctuate + de-filler (backs up to .raw/)
```

Adding a new course? See **`docs/ADDING-A-YOUTUBE-COURSE.md`** for the full
workflow (define course → fetch → clean → register directory in `Transcript.tsx`).
