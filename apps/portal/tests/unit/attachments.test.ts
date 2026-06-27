import { describe, it, expect } from "vitest";
import {
  ATTACHMENT_LIMITS,
  validateUpload,
  formatBytes,
  sanitizeFilename,
  canInline,
  fileIcon,
} from "@/lib/attachments";

describe("validateUpload", () => {
  it("accepts a normal file", () => {
    expect(validateUpload({ name: "brief.pdf", size: 1024 })).toEqual({ ok: true });
  });
  it("rejects an empty file", () => {
    const r = validateUpload({ name: "x.txt", size: 0 });
    expect(r.ok).toBe(false);
  });
  it("rejects a file with no name", () => {
    const r = validateUpload({ name: "   ", size: 10 });
    expect(r.ok).toBe(false);
  });
  it("rejects a file over the size limit", () => {
    const r = validateUpload({ name: "huge.zip", size: ATTACHMENT_LIMITS.maxBytes + 1 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/larger than/);
  });
  it("accepts a file exactly at the limit", () => {
    expect(validateUpload({ name: "max.bin", size: ATTACHMENT_LIMITS.maxBytes }).ok).toBe(true);
  });
});

describe("formatBytes", () => {
  it("formats zero and small sizes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
  });
  it("formats KB/MB with one decimal under 10", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(15 * 1024 * 1024)).toBe("15 MB");
  });
  it("never returns NaN for negatives", () => {
    expect(formatBytes(-5)).toBe("0 B");
  });
});

describe("sanitizeFilename", () => {
  it("strips directory components", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFilename("C:\\Users\\me\\notes.txt")).toBe("notes.txt");
  });
  it("removes quotes and control characters", () => {
    expect(sanitizeFilename('a"b.txt')).toBe("ab.txt");
    expect(sanitizeFilename("line\nbreak.txt")).toBe("linebreak.txt");
  });
  it("falls back to 'file' when empty", () => {
    expect(sanitizeFilename("")).toBe("file");
    expect(sanitizeFilename("///")).toBe("file");
  });
});

describe("canInline", () => {
  it("allows pdf and images, blocks the rest", () => {
    expect(canInline("application/pdf")).toBe(true);
    expect(canInline("image/png")).toBe(true);
    expect(canInline("text/html")).toBe(false);
    expect(canInline("application/octet-stream")).toBe(false);
  });
});

describe("fileIcon", () => {
  it("maps common types to an icon", () => {
    expect(fileIcon("application/pdf")).toBe("📕");
    expect(fileIcon("image/jpeg")).toBe("🖼️");
    expect(fileIcon("application/zip")).toBe("🗜️");
    expect(fileIcon("text/plain")).toBe("📄");
    expect(fileIcon("application/octet-stream")).toBe("📎");
  });
});
