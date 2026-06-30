import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@portal/db";
import { files, attachments } from "@portal/db/schema";
import {
  ATTACHMENT_LIMITS,
  sanitizeFilename,
  validateUpload,
  type AttachmentTarget,
} from "./attachments";

export type AttachmentMeta = {
  attachmentId: string;
  fileId: string;
  name: string;
  contentType: string;
  size: number;
};

export type StoredFile = {
  id: string;
  name: string;
  contentType: string;
  size: number;
};

/**
 * Read File[] from a multipart form field and store the bytes in ss_files.
 * Returns the stored file rows (no linking). Invalid files (empty / too big)
 * are skipped — the UI enforces the same limits.
 */
export async function saveFilesFromForm(
  formData: FormData,
  field: string,
  uploadedBy?: string | null,
): Promise<StoredFile[]> {
  const incoming = formData
    .getAll(field)
    .filter((v): v is File => v instanceof File && v.size > 0)
    .slice(0, ATTACHMENT_LIMITS.maxFiles);
  if (!incoming.length) return [];

  const stored: StoredFile[] = [];
  for (const file of incoming) {
    const check = validateUpload({ name: file.name, size: file.size, type: file.type });
    if (!check.ok) continue;
    const buf = Buffer.from(await file.arrayBuffer());
    const [row] = await db
      .insert(files)
      .values({
        name: sanitizeFilename(file.name),
        contentType: file.type || "application/octet-stream",
        size: buf.byteLength,
        data: buf,
        uploadedBy: uploadedBy ?? null,
      })
      .returning({
        id: files.id,
        name: files.name,
        contentType: files.contentType,
        size: files.size,
      });
    stored.push(row);
  }
  return stored;
}

type BlobRef = {
  url: string;
  pathname: string;
  name: string;
  size: number;
  contentType: string;
};

function parseBlobRefs(raw: FormDataEntryValue | null): BlobRef[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(
        (r): r is Record<string, unknown> =>
          !!r &&
          typeof r === "object" &&
          typeof (r as Record<string, unknown>).url === "string" &&
          ((r as Record<string, unknown>).url as string).startsWith("http"),
      )
      .slice(0, ATTACHMENT_LIMITS.maxFiles)
      .map((r) => ({
        url: String(r.url),
        pathname: String(r.pathname ?? ""),
        name: sanitizeFilename(String(r.name ?? "file")),
        size:
          typeof r.size === "number" && Number.isFinite(r.size)
            ? Math.max(0, Math.min(r.size, ATTACHMENT_LIMITS.maxBytes))
            : 0,
        contentType: String(r.contentType ?? "application/octet-stream"),
      }));
  } catch {
    return [];
  }
}

/**
 * Persist Vercel Blob references (uploaded client-side) as ss_files rows.
 * Stores the URL, not bytes. Returns the stored file rows (no linking).
 */
export async function saveBlobRefsFromForm(
  formData: FormData,
  field = "blobRefs",
  uploadedBy?: string | null,
): Promise<StoredFile[]> {
  const refs = parseBlobRefs(formData.get(field));
  if (!refs.length) return [];
  const stored: StoredFile[] = [];
  for (const r of refs) {
    const [row] = await db
      .insert(files)
      .values({
        name: r.name,
        contentType: r.contentType,
        size: r.size,
        url: r.url,
        pathname: r.pathname || null,
        uploadedBy: uploadedBy ?? null,
      })
      .returning({
        id: files.id,
        name: files.name,
        contentType: files.contentType,
        size: files.size,
      });
    stored.push(row);
  }
  return stored;
}

/** Like saveAttachmentsFromForm, but for Blob refs uploaded from the browser. */
export async function saveBlobAttachmentsFromForm(
  formData: FormData,
  field: string,
  targetType: AttachmentTarget,
  targetId: string,
  uploadedBy?: string | null,
): Promise<number> {
  const stored = await saveBlobRefsFromForm(formData, field, uploadedBy);
  if (!stored.length) return 0;
  await db
    .insert(attachments)
    .values(stored.map((f) => ({ fileId: f.id, targetType, targetId })));
  return stored.length;
}

/**
 * Store File[] from a form field and link each to a target via ss_attachments.
 * Returns the number saved.
 */
export async function saveAttachmentsFromForm(
  formData: FormData,
  field: string,
  targetType: AttachmentTarget,
  targetId: string,
  uploadedBy?: string | null,
): Promise<number> {
  const stored = await saveFilesFromForm(formData, field, uploadedBy);
  if (!stored.length) return 0;
  await db
    .insert(attachments)
    .values(stored.map((f) => ({ fileId: f.id, targetType, targetId })));
  return stored.length;
}

/** All attachments for one target, newest first. */
export async function getAttachmentsFor(
  targetType: AttachmentTarget,
  targetId: string,
): Promise<AttachmentMeta[]> {
  return db
    .select({
      attachmentId: attachments.id,
      fileId: files.id,
      name: files.name,
      contentType: files.contentType,
      size: files.size,
    })
    .from(attachments)
    .innerJoin(files, eq(files.id, attachments.fileId))
    .where(
      and(eq(attachments.targetType, targetType), eq(attachments.targetId, targetId)),
    )
    .orderBy(desc(attachments.createdAt));
}

/** Batch lookup: targetId -> attachments, for lists. */
export async function getAttachmentsForMany(
  targetType: AttachmentTarget,
  targetIds: string[],
): Promise<Map<string, AttachmentMeta[]>> {
  const ids = [...new Set(targetIds.filter(Boolean))];
  const map = new Map<string, AttachmentMeta[]>();
  if (!ids.length) return map;
  const rows = await db
    .select({
      targetId: attachments.targetId,
      attachmentId: attachments.id,
      fileId: files.id,
      name: files.name,
      contentType: files.contentType,
      size: files.size,
    })
    .from(attachments)
    .innerJoin(files, eq(files.id, attachments.fileId))
    .where(
      and(
        eq(attachments.targetType, targetType),
        inArray(attachments.targetId, ids),
      ),
    )
    .orderBy(desc(attachments.createdAt));
  for (const r of rows) {
    const list = map.get(r.targetId) ?? [];
    list.push({
      attachmentId: r.attachmentId,
      fileId: r.fileId,
      name: r.name,
      contentType: r.contentType,
      size: r.size,
    });
    map.set(r.targetId, list);
  }
  return map;
}

/** Fetch a file for the download route — either Blob-backed (url) or DB bytes. */
export async function getFileForDownload(id: string): Promise<{
  name: string;
  contentType: string;
  data: Buffer | null;
  url: string | null;
} | null> {
  const [row] = await db
    .select({
      name: files.name,
      contentType: files.contentType,
      data: files.data,
      url: files.url,
    })
    .from(files)
    .where(eq(files.id, id))
    .limit(1);
  return row ?? null;
}

/** Detach a file from a target, and drop the file if nothing else uses it. */
export async function deleteAttachment(attachmentId: string): Promise<void> {
  const [att] = await db
    .select({ fileId: attachments.fileId })
    .from(attachments)
    .where(eq(attachments.id, attachmentId))
    .limit(1);
  if (!att) return;
  await db.delete(attachments).where(eq(attachments.id, attachmentId));
  const refs = await db
    .select({ id: attachments.id })
    .from(attachments)
    .where(eq(attachments.fileId, att.fileId))
    .limit(1);
  if (!refs.length) await db.delete(files).where(eq(files.id, att.fileId));
}
