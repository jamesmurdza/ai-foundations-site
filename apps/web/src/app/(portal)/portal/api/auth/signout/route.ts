import { NextResponse } from "next/server";
import { destroySession } from "@portal/lib/session";
import { env } from "@portal/lib/env";

export async function POST() {
  await destroySession();
  // env.baseUrl is the public /portal URL; never req.url (multi-zone origin leak).
  return NextResponse.redirect(new URL(`${env.baseUrl}/`));
}
