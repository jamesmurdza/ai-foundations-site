/**
 * Pure helpers + limits for downloadable attachments. No DB / server-only here
 * so this stays unit-testable and importable from client components.
 */

export const ATTACHMENT_LIMITS = {
  /**
   * Max bytes per file. Files upload straight to Vercel Blob from the browser,
   * so this is a product limit, not the old ~4.5 MB serverless body cap.
   */
  maxBytes: 100 * 1024 * 1024,
  /** Max files accepted from a single form submission. */
  maxFiles: 10,
} as const;

/** Targets that can carry attachments. */
export type AttachmentTarget =
  | "announcement"
  | "assignment"
  | "week"
  | "resource"
  | "submission"
  | "profile";

const INLINE_TYPES = new Set(["application/pdf"]);

/** Types safe to render inline; everything else is forced to download. */
export function canInline(contentType: string): boolean {
  return INLINE_TYPES.has(contentType) || contentType.startsWith("image/");
}

/** Strip path components and control chars so a name is safe in a header. */
export function sanitizeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  let out = "";
  for (const ch of base) {
    const code = ch.charCodeAt(0);
    if (code < 0x20 || code === 0x7f || ch === '"') continue;
    out += ch;
  }
  out = out.trim().slice(0, 200);
  return out || "file";
}

/** Human-readable byte size, e.g. 1536 -> "1.5 KB", 1024 -> "1 KB". */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const n = bytes / Math.pow(1024, i);
  const rounded = i === 0 ? Math.round(n) : Math.round(n * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} ${units[i]}`;
}

export type UploadCandidate = { name: string; size: number; type?: string };

/** Validate a single upload candidate against the limits. */
export function validateUpload(
  f: UploadCandidate,
): { ok: true } | { ok: false; error: string } {
  if (!f.name || !f.name.trim()) return { ok: false, error: "File is missing a name" };
  if (f.size <= 0) return { ok: false, error: "File is empty" };
  if (f.size > ATTACHMENT_LIMITS.maxBytes) {
    return {
      ok: false,
      error: `${sanitizeFilename(f.name)} is larger than ${formatBytes(ATTACHMENT_LIMITS.maxBytes)}`,
    };
  }
  return { ok: true };
}

/** A short icon for a content type, for list display. */
export function fileIcon(contentType: string): string {
  if (contentType.startsWith("image/")) return "🖼️";
  if (contentType === "application/pdf") return "📕";
  if (contentType.includes("word") || contentType.includes("document")) return "📝";
  if (
    contentType.includes("sheet") ||
    contentType.includes("excel") ||
    contentType.includes("csv")
  )
    return "📊";
  if (contentType.includes("presentation") || contentType.includes("powerpoint"))
    return "📈";
  if (contentType.includes("zip") || contentType.includes("compressed")) return "🗜️";
  if (contentType.startsWith("text/")) return "📄";
  return "📎";
}
