import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/queries";
import {
  getApplicationById,
  findApplicationForUser,
  publicFieldsFromApplication,
} from "@/lib/applications";
import { onboardingFinish } from "@/lib/actions/profile";
import { OnboardingSteps } from "@/components/OnboardingSteps";
import { SubmitButton } from "@/components/SubmitButton";
import { withBase } from "@/lib/paths";

export default async function OnboardingConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const { user } = await getSessionContext();
  if (!user) redirect("/login");
  const profile = await getProfileByUserId(user.id);

  // Pull socials from their application so GitHub/site prefill even when they
  // didn't OAuth-connect (the autofill gap that left some profiles blank).
  const application =
    (user.applicationId ? await getApplicationById(user.applicationId) : null) ??
    (await findApplicationForUser({
      email: user.email,
      githubLogin: user.githubLogin,
    }));
  const seed = application ? publicFieldsFromApplication(application) : null;

  const connected = Boolean(
    user.githubId && !String(user.githubId).startsWith("dev:"),
  );

  return (
    <div className="container-page py-12 max-w-[640px]">
      <OnboardingSteps current={3} />
      <h1 className="text-[34px]">Connect your GitHub</h1>
      <p className="meta mt-2 mb-6">
        This powers Trade Stars (auto-starring repo posts), following peers on
        GitHub, and your GitHub glow-up. You can also do it later.
      </p>

      {sp.error === "link" && (
        <div className="mb-5 rounded-[11px] bg-primary-soft text-primary-strong text-[14px] px-4 py-3">
          That GitHub account is already linked to another profile.
        </div>
      )}

      <div className="card !p-6 mb-6">
        {connected ? (
          <div className="flex items-center gap-3">
            <span className="badge badge-teal">Connected ✓</span>
            <span className="font-semibold">@{user.githubLogin}</span>
            <a href={withBase("/api/auth/github")} className="btn btn-outline btn-sm ml-auto">Reconnect</a>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="meta text-[14px]">Not connected yet.</div>
            <a href={withBase("/api/auth/github")} className="btn btn-dark">
              <GithubMark /> Connect GitHub
            </a>
          </div>
        )}
      </div>

      <form action={onboardingFinish} className="card !p-7 space-y-4 fade-up">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">GitHub</label>
            <input
              className="input"
              name="githubUrl"
              defaultValue={
                profile?.githubUrl ??
                seed?.githubUrl ??
                (user.githubLogin && connected ? `https://github.com/${user.githubLogin}` : "")
              }
              placeholder="https://github.com/you"
            />
          </div>
          <div>
            <label className="label">Website / portfolio</label>
            <input
              className="input"
              name="siteUrl"
              defaultValue={profile?.siteUrl ?? seed?.siteUrl ?? ""}
            />
          </div>
          <div>
            <label className="label">LinkedIn</label>
            <input className="input" name="linkedinUrl" defaultValue={profile?.linkedinUrl ?? ""} />
          </div>
          <div>
            <label className="label">X / Twitter</label>
            <input className="input" name="xUrl" defaultValue={profile?.xUrl ?? ""} />
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer rounded-2xl bg-ice-tint p-4">
          <input
            type="checkbox"
            name="tradeStarsEnabled"
            defaultChecked
            className="mt-1 w-4 h-4 accent-primary"
          />
          <span className="text-[14px]">
            <span className="font-semibold">Trade stars with the cohort ⭐</span>
            <br />
            <span className="meta">
              When this is on, every repo you submit gets auto-starred by everyone
              else who opted in — and you star theirs. Builds everyone&apos;s GitHub
              together. You can change this anytime on your profile.
            </span>
          </span>
        </label>

        <div className="flex justify-between items-center">
          <Link href="/onboarding/goals" className="link text-[14px]">← Back</Link>
          <SubmitButton className="btn btn-primary">Finish &amp; enter the portal →</SubmitButton>
        </div>
      </form>
    </div>
  );
}

function GithubMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
