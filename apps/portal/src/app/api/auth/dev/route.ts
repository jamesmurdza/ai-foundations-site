import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { upsertDevUser } from "@/lib/users";
import { createSession } from "@/lib/session";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  if (!env.devLoginEnabled) {
    return NextResponse.redirect(new URL("/login?error=dev_disabled", req.url));
  }
  const form = await req.formData();
  const email = String(form.get("email") ?? "").trim();
  const name = String(form.get("name") ?? "").trim() || email.split("@")[0];

  if (!email || !email.includes("@")) {
    return NextResponse.redirect(new URL("/login?error=email", req.url));
  }

  const { user } = await upsertDevUser(email, name);
  await createSession(user.id);

  const [profile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  return NextResponse.redirect(
    new URL(profile ? "/home" : "/onboarding", req.url),
  );
}
