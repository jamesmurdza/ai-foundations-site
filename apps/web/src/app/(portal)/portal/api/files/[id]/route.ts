import { getFileForDownload } from "@portal/lib/files";
import { canInline, sanitizeFilename } from "@portal/lib/attachments";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const file = await getFileForDownload(id);
  if (!file) return new Response("Not found", { status: 404 });

  // Blob-backed files live on Vercel Blob — hand the client the public URL.
  if (file.url) {
    return Response.redirect(file.url, 307);
  }
  if (!file.data) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  const inline =
    url.searchParams.get("inline") === "1" && canInline(file.contentType);
  const filename = sanitizeFilename(file.name);
  const disposition = inline ? "inline" : "attachment";

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Disposition": `${disposition}; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Content-Length": String(file.data.byteLength),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
