import { fileIcon, formatBytes } from "@portal/lib/attachments";
import type { AttachmentMeta } from "@portal/lib/files";

/** Download chips for an entity's attachments. Renders nothing when empty. */
export function AttachmentList({
  items,
  title = "Attachments",
  showTitle = true,
}: {
  items: AttachmentMeta[];
  title?: string;
  showTitle?: boolean;
}) {
  if (!items.length) return null;
  return (
    <div className="mt-3">
      {showTitle && (
        <div className="meta-light text-[12px] font-semibold uppercase tracking-wide mb-1.5">
          {title} ({items.length})
        </div>
      )}
      <ul className="flex flex-wrap gap-2">
        {items.map((a) => (
          <li key={a.attachmentId}>
            <a
              href={`/api/files/${a.fileId}`}
              download
              data-testid="attachment-download"
              className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-muted px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <span aria-hidden>{fileIcon(a.contentType)}</span>
              <span className="max-w-[220px] truncate">{a.name}</span>
              <span className="meta-light">{formatBytes(a.size)}</span>
              <span aria-hidden>↓</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
