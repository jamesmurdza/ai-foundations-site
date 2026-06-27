import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Lesson, ResolvedTab } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content", "courses");

const DEFAULT_LABELS: Record<string, string> = {
  about: "About",
  notes: "Notes",
  material: "Material",
  transcript: "Transcript",
};

function labelFor(type: string, override?: string): string {
  if (override) return override;
  return DEFAULT_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

// Resolve a lesson's declared tabs into render-ready data. Markdown tabs read
// their file at build time; a markdown tab whose file is missing is dropped so
// the UI never shows an empty tab.
export function getLessonTabs(courseSlug: string, lesson: Lesson): ResolvedTab[] {
  const resolved: ResolvedTab[] = [];

  for (const tab of lesson.tabs ?? []) {
    const label = labelFor(tab.type, tab.label);

    if (tab.type === "material") {
      resolved.push({ type: tab.type, label, kind: "material" });
      continue;
    }
    if (tab.type === "transcript") {
      resolved.push({ type: tab.type, label, kind: "transcript" });
      continue;
    }

    // Inline content wins; otherwise read the markdown file. A markdown tab with
    // neither is dropped so the UI never shows an empty tab.
    let markdown = tab.content;
    if (markdown === undefined) {
      const file = tab.file ?? `${tab.type}.md`;
      const filePath = path.join(CONTENT_DIR, courseSlug, lesson.id, file);
      if (!fs.existsSync(filePath)) continue;
      markdown = fs.readFileSync(filePath, "utf8");
    }

    resolved.push({
      type: tab.type,
      label,
      kind: "markdown",
      markdown,
    });
  }

  return resolved;
}
