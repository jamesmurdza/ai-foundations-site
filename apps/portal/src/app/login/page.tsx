import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { requestLoginCode, verifyLoginCode } from "@/lib/actions/auth-code";
import { SubmitButton } from "@/components/SubmitButton";

const ERRORS: Record<string, string> = {
  email: "Enter a valid email address.",
  code: "That code didn't match or has expired — try again.",
  code_wrong: "That code wasn't right. Double-check the 6 digits and try again.",
  code_expired:
    "That code has expired (they last 30 minutes). Tap “Resend code” for a fresh one.",
  code_locked: "Too many tries. Tap “Resend code” to get a new one and start over.",
  state: "Your sign-in session expired. Please try again.",
  oauth: "Something went wrong talking to GitHub.",
  dev_disabled: "Dev login is disabled.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    step?: string;
    email?: string;
    error?: string;
    resent?: string;
  }>;
}) {
  if (await getCurrentUser()) redirect("/home");
  const sp = await searchParams;
  const error = sp.error ? ERRORS[sp.error] ?? "Sign-in failed." : null;
  const resent = sp.resent === "1";
  const onCodeStep = sp.step === "code" && sp.email;

  return (
    <div className="container-page py-20 flex justify-center">
      <div className="card w-full max-w-[440px] !p-8 fade-up">
        <div className="text-primary font-heading font-bold text-[20px] mb-1">
          AI Foundations
        </div>

        {error && (
          <div className="my-4 rounded-[11px] bg-primary-soft text-primary-strong text-[14px] px-4 py-3">
            {error}
          </div>
        )}

        {!onCodeStep ? (
          <>
            <h1 className="text-[28px] mb-2">Sign in</h1>
            <p className="meta mb-6">
              Enter your email and we&apos;ll send you a 6-digit code.
            </p>
            <form action={requestLoginCode} className="flex flex-col gap-3">
              <input
                className="input"
                type="email"
                name="email"
                placeholder="you@email.com"
                defaultValue={sp.email ?? ""}
                autoFocus
                required
              />
              <SubmitButton className="btn btn-primary w-full" pendingText="Sending code…">
                Email me a code →
              </SubmitButton>
            </form>

            {env.devLoginEnabled && (
              <>
                <div className="flex items-center gap-3 my-6">
                  <span className="hairline flex-1" />
                  <span className="meta-light text-[12px]">or dev login</span>
                  <span className="hairline flex-1" />
                </div>
                <form action="/api/auth/dev" method="post" className="flex gap-2">
                  <input
                    className="input"
                    type="email"
                    name="email"
                    data-testid="dev-email"
                    placeholder="dev@example.com"
                    required
                  />
                  <button type="submit" className="btn btn-outline">Continue</button>
                </form>
                <p className="meta-light text-[12px] mt-2">
                  Dev login skips email — for testing only.
                </p>
              </>
            )}
          </>
        ) : (
          <>
            <h1 className="text-[28px] mb-2">Check your email</h1>
            {resent && !error && (
              <div className="my-4 rounded-[11px] bg-active-teal/10 text-primary-strong text-[14px] px-4 py-3">
                ✓ New code sent to {sp.email} — enter the most recent one (older
                codes stop working).
              </div>
            )}
            <p className="meta mb-6">
              A 6-digit code is on its way to{" "}
              <span className="font-semibold text-foreground">{sp.email}</span>. Enter it below.
            </p>
            <form action={verifyLoginCode} className="flex flex-col gap-3">
              <input type="hidden" name="email" value={sp.email} />
              <input
                className="input text-center text-[24px] tracking-[0.4em] font-semibold"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="······"
                autoFocus
                required
              />
              <SubmitButton className="btn btn-primary w-full" pendingText="Verifying…">
                Verify &amp; sign in
              </SubmitButton>
            </form>
            <div className="flex items-center justify-between mt-4 text-[13px]">
              <Link href="/login" className="link">← Use a different email</Link>
              <form action={requestLoginCode}>
                <input type="hidden" name="email" value={sp.email} />
                <input type="hidden" name="resend" value="1" />
                <button className="link" type="submit">Resend code</button>
              </form>
            </div>
          </>
        )}

        <p className="meta text-[13px] mt-7 text-center">
          <Link href="/" className="link">← Back to the homepage</Link>
        </p>
      </div>
    </div>
  );
}
