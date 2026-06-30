import { NextRequest, NextResponse } from "next/server";

import {
  clearNotified,
  listPendingNotifications,
  markNotified,
} from "@dashboard/lib/applications";
import { sendThankYou } from "@dashboard/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

async function run() {
  const pending = await listPendingNotifications(50);
  let sent = 0;
  let failed = 0;
  const errors: Array<{ id: string; error: string }> = [];

  for (const app of pending) {
    if (!app.email) {
      // No email to notify — claim it so we don't keep retrying forever.
      await markNotified(app.id);
      continue;
    }
    const claimed = await markNotified(app.id);
    if (!claimed) continue; // someone else got it

    try {
      await sendThankYou(app.email, app.name);
      sent += 1;
    } catch (err) {
      failed += 1;
      errors.push({
        id: app.id,
        error: err instanceof Error ? err.message : String(err),
      });
      // Hand the row back so the next cron run retries.
      await clearNotified(app.id);
    }
  }

  return { processed: pending.length, sent, failed, errors };
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await run();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await run();
  return NextResponse.json(result);
}
