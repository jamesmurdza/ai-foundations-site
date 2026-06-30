import { NextResponse } from "next/server";

import { getStars } from "@/lib/stars";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const stars = await getStars();
  return NextResponse.json(
    { stars, fetchedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
