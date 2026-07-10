# Transcripts

Cached YouTube caption data, one JSON file per video:

```
<courseDir>/video_<videoId>.json   # cleaned, served to the app
<courseDir>/.raw/video_<videoId>.json   # pristine raw backup (do not edit)
```

Each file is a flat array of `{ "text": string, "start": number, "duration": number }`
segments. The `.raw/` copies are the untouched YouTube captions; the top-level
files are the LLM-cleaned versions (see `npm run clean:transcripts`).

Adding a new course? See **`docs/ADDING-A-YOUTUBE-COURSE.md`** for the full
workflow (fetch → register directory in `Transcript.tsx` → clean → define course).
