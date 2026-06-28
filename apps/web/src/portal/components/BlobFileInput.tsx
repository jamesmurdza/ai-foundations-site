"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { ATTACHMENT_LIMITS, formatBytes } from "@portal/lib/attachments";

type Item = {
  key: string;
  name: string;
  size: number;
  contentType: string;
  status: "uploading" | "done" | "error";
  percentage: number;
  url?: string;
  pathname?: string;
  error?: string;
};

/**
 * Multi-file uploader that sends files straight to Vercel Blob from the browser
 * (no 4.5 MB serverless limit). Completed uploads are serialized into a hidden
 * `blobRefs` field that the server action reads via saveBlobRefsFromForm.
 */
export function BlobFileInput({
  name = "blobRefs",
  label = "Attach files (optional)",
  hint,
}: {
  name?: string;
  label?: string;
  hint?: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const uploading = items.some((i) => i.status === "uploading");

  const update = (key: string, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));

  async function handleFiles(files: FileList | null) {
    const list = Array.from(files ?? []).slice(0, ATTACHMENT_LIMITS.maxFiles);
    if (!list.length) return;

    const next: Item[] = list.map((f, i) => ({
      key: `${Date.now()}-${i}-${f.name}`,
      name: f.name,
      size: f.size,
      contentType: f.type || "application/octet-stream",
      status: f.size > ATTACHMENT_LIMITS.maxBytes ? "error" : "uploading",
      percentage: 0,
      error:
        f.size > ATTACHMENT_LIMITS.maxBytes
          ? `Over ${formatBytes(ATTACHMENT_LIMITS.maxBytes)} limit`
          : undefined,
    }));
    setItems(next);

    await Promise.all(
      list.map(async (file, i) => {
        const item = next[i];
        if (item.status === "error") return;
        try {
          const res = await upload(`uploads/${file.name}`, file, {
            access: "public",
            handleUploadUrl: "/api/blob/upload",
            multipart: file.size > 5 * 1024 * 1024,
            onUploadProgress: ({ percentage }) =>
              update(item.key, { percentage }),
          });
          update(item.key, {
            status: "done",
            percentage: 100,
            url: res.url,
            pathname: res.pathname,
          });
        } catch (e) {
          update(item.key, {
            status: "error",
            error: (e as Error).message || "Upload failed",
          });
        }
      }),
    );
  }

  const refs = items
    .filter((i) => i.status === "done" && i.url)
    .map((i) => ({
      url: i.url,
      pathname: i.pathname,
      name: i.name,
      size: i.size,
      contentType: i.contentType,
    }));

  return (
    <div>
      <label className="label">{label}</label>
      <input type="hidden" name={name} value={JSON.stringify(refs)} readOnly />
      <input
        type="file"
        multiple
        data-testid="blob-file-input"
        onChange={(e) => handleFiles(e.target.files)}
        className="block w-full cursor-pointer rounded-[11px] border border-border bg-white p-2 text-[14px] text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-[9px] file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-primary-strong"
      />
      <p className="meta-light text-[12px] mt-1">
        {hint ??
          `Up to ${ATTACHMENT_LIMITS.maxFiles} files, ${formatBytes(ATTACHMENT_LIMITS.maxBytes)} each — any file type.`}
      </p>

      {items.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {items.map((f) => (
            <li key={f.key} className="text-[13px]">
              <div className="flex items-center justify-between gap-2">
                <span className={f.status === "error" ? "text-red-600" : "meta"}>
                  📎 {f.name}{" "}
                  <span className="meta-light">{formatBytes(f.size)}</span>
                </span>
                <span
                  className={
                    f.status === "done"
                      ? "text-active-teal font-semibold"
                      : f.status === "error"
                        ? "text-red-600"
                        : "meta-light"
                  }
                >
                  {f.status === "done"
                    ? "uploaded ✓"
                    : f.status === "error"
                      ? (f.error ?? "failed")
                      : `${f.percentage}%`}
                </span>
              </div>
              {f.status === "uploading" && (
                <div className="mt-1 h-1 w-full rounded-full bg-ice-tint">
                  <div
                    className="h-1 rounded-full bg-primary transition-all"
                    style={{ width: `${f.percentage}%` }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {uploading && (
        <p className="text-[12px] text-primary-strong mt-1">
          Uploading… wait for ✓ before you submit.
        </p>
      )}
    </div>
  );
}
