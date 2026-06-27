import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

export async function POST(req: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/", req.url));
}
