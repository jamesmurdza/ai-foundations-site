import { NextRequest, NextResponse, after } from "next/server";
import { sql } from "@site/lib/db";
import { sendThankYou } from "@site/lib/email";
import { syncOneToTinysend } from "@portal/lib/tinysend-sync";

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
  const submitted = (await sql`
    UPDATE hh_applications
       SET status = 'submitted',
           submitted_at = NOW(),
           updated_at = NOW()
     WHERE id = ${id}
    RETURNING email, name
  `) as { email: string | null; name: string | null }[];

  // Instant best-effort: add the applicant to the tinysend mailing list right away
  // so the twice-daily reconciler cron is only a safety net. syncOneToTinysend never
  // throws, writes the ledger on success (so the cron skips it), and no-ops when
  // TINYSEND_API_KEY is unset. Runs post-response via after() so submit stays fast.
  const applicant = submitted[0];
  if (applicant?.email) {
    const email = applicant.email;
    const name = applicant.name;
    after(() => syncOneToTinysend(email, name));
  }

  // Fire-and-forget the thank-you email so submit returns instantly. notifyApplicant
  // claims the notification slot atomically (the cron skips claimed rows) and releases
  // it on send failure so the cron backstop retries later.
  after(() => notifyApplicant(id));

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
