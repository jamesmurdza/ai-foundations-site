import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getCurrentUser } from "@/lib/auth";
import { ATTACHMENT_LIMITS } from "@/lib/attachments";

export const dynamic = "force-dynamic";

// Hands the browser a short-lived token so it can upload a file straight to
// Vercel Blob — bypassing the 4.5 MB serverless request-body limit. Requires
// BLOB_READ_WRITE_TOKEN in the environment (Vercel Blob store).
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("You must be signed in to upload.");
        return {
          addRandomSuffix: true,
          maximumSizeInBytes: ATTACHMENT_LIMITS.maxBytes,
          tokenPayload: JSON.stringify({ userId: user.id }),
        };
      },
      // onUploadCompleted only fires on a publicly reachable URL; we persist the
      // file row from the submitted form instead, so it's a no-op here.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
