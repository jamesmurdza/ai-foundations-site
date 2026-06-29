"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { createLoginCode, mayRequestLoginCode, verifyCode } from "@/lib/login-codes";
import { upsertUserByEmail } from "@/lib/users";
import { createSession } from "@/lib/session";
import { sendEmail, templates } from "@/lib/email";

function cleanEmail(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim().toLowerCase();
}

export async function requestLoginCode(formData: FormData) {
  const email = cleanEmail(formData.get("email"));
  const isResend = formData.get("resend") === "1";
  // Sign-up is open: anyone with a well-formed email gets a code (no applicant
  // or admin requirement). mayRequestLoginCode is the single gate.
  if (!mayRequestLoginCode(email)) redirect("/?error=email");

  const code = await createLoginCode(email);
  const t = templates.loginCode(code);
  // Send in the background (after the response) so the code-entry dialog shows
  // instantly instead of waiting on SMTP. after() uses waitUntil on Vercel, so
  // the email still reliably goes out.
  after(() =>
    sendEmail({ to: email, type: "login_code", subject: t.subject, html: t.html }),
  );

  const suffix = isResend ? "&resent=1" : "";
  redirect(`/?step=code&email=${encodeURIComponent(email)}${suffix}`);
}

export async function verifyLoginCode(formData: FormData) {
  const email = cleanEmail(formData.get("email"));
  const code = String(formData.get("code") ?? "").trim();
  const back = `/?step=code&email=${encodeURIComponent(email)}`;
  if (!email || !code) redirect(`${back}&error=code_wrong`);

  const result = await verifyCode(email, code);
  if (result !== "ok") redirect(`${back}&error=code_${result}`);

  const { user } = await upsertUserByEmail(email);
  await createSession(user.id);

  const [profile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  redirect(profile ? "/home" : "/onboarding");
}
