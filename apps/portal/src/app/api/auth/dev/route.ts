import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { upsertDevUser } from "@/lib/users";
import { createSession } from "@/lib/session";
import { env } from "@/lib/env";

// basePath-aware public redirect (env.baseUrl ends in /portal); never req.url.
const appUrl = (path: string) => new URL(`${env.baseUrl}${path}`);

export async function POST(req: Request) {
  if (!env.devLoginEnabled) {
    return NextResponse.redirect(appUrl("/login?error=dev_disabled"));
  }
  const form = await req.formData();
  const email = String(form.get("email") ?? "").trim();
  const name = String(form.get("name") ?? "").trim() || email.split("@")[0];

  if (!email || !email.includes("@")) {
    return NextResponse.redirect(appUrl("/login?error=email"));
  }

  const { user } = await upsertDevUser(email, name);
  await createSession(user.id);

  const [profile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  return NextResponse.redirect(appUrl(profile ? "/home" : "/onboarding"));
}
