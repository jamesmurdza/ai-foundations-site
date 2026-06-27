import { NextRequest, NextResponse } from "next/server";
import { sql } from "@site/lib/db";
import { sendThankYou } from "@site/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: RouteCtx) {
  const { id } = await params;
  const rows = (await sql`
    SELECT status FROM hh_applications WHERE id = ${id} LIMIT 1
  `) as Record<string, unknown>[];
  if (rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (rows[0].status === "submitted") {
    return NextResponse.json({ error: "already_submitted" }, { status: 409 });
  }
  await sql`
    UPDATE hh_applications
       SET status = 'submitted',
           submitted_at = NOW(),
           updated_at = NOW()
     WHERE id = ${id}
  `;

  // Atomically claim the notification slot. If we win, we own the send;
  // the admin-side cron will skip this row. If the send fails, we null
  // the column back so the cron picks it up later. Bounded by SMTP
  // timeouts in src/lib/email.ts so a hung server can't hang submit.
  await notifyApplicant(id);

  return NextResponse.json({ ok: true });
}

async function notifyApplicant(id: string): Promise<void> {
  let claimed: { email: string | null; name: string | null }[];
  try {
    claimed = (await sql`
      UPDATE hh_applications
         SET notification_sent_at = NOW()
       WHERE id = ${id}
         AND notification_sent_at IS NULL
      RETURNING email, name
    `) as { email: string | null; name: string | null }[];
  } catch (err) {
    console.error("[notify] claim failed", { id, err });
    return;
  }
  if (claimed.length === 0) return; // someone else already sent

  const row = claimed[0];
  if (!row.email) return; // nothing we can do; row stays claimed

  try {
    await sendThankYou(row.email, row.name);
  } catch (err) {
    console.error("[notify] send failed; releasing for cron retry", {
      id,
      err,
    });
    try {
      await sql`
        UPDATE hh_applications
           SET notification_sent_at = NULL
         WHERE id = ${id}
      `;
    } catch (releaseErr) {
      console.error("[notify] release also failed", { id, releaseErr });
    }
  }
}
