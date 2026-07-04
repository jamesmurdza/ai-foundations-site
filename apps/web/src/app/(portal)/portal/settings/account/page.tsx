import { redirect } from "@portal/lib/nav";
import { getSessionContext } from "@portal/lib/auth";
import { importGithubSocials, setProfileTradeStars } from "@portal/lib/actions/profile";
import { SubmitButton } from "@portal/components/SubmitButton";
import { withBase } from "@portal/lib/paths";

export default async function SettingsAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; imported?: string }>;
}) {
  const sp = await searchParams;
  const { user, profile } = await getSessionContext();
  if (!user) redirect("/login");
  if (!profile) redirect("/onboarding");

  const connected = Boolean(
    user.githubId && !String(user.githubId).startsWith("dev:"),
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-heading">Account</h2>
        <p className="meta">Your GitHub connection and cohort star sharing.</p>
      </div>

      {sp.imported === "1" && (
        <div className="mb-5 rounded-[11px] bg-ice-tint text-slate-channel text-[14px] px-4 py-3">
          Imported your links from GitHub.
        </div>
      )}
      {sp.error === "no_github" && (
        <div className="mb-5 rounded-[11px] bg-primary-soft text-primary-strong text-[14px] px-4 py-3">
          Connect GitHub first.
        </div>
      )}

      <div className="space-y-6 fade-up">
        {/* GitHub connection */}
        <div>
          <div className="label mb-2">GitHub connection</div>
          {connected ? (
            <form className="flex items-center gap-3 flex-wrap">
              <span className="badge badge-teal">Connected ✓</span>
              <span className="font-semibold">@{user.githubLogin}</span>
              <button
                type="submit"
                formAction={importGithubSocials}
                className="btn btn-outline btn-sm ml-auto"
              >
                Import links from GitHub
              </button>
              <a href={withBase("/api/auth/github")} className="btn btn-ghost btn-sm">Reconnect</a>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="meta text-[14px]">
                Connect to enable Trade Stars and your GitHub glow-up.
              </div>
              <a href={withBase("/api/auth/github")} className="btn btn-dark">Connect GitHub</a>
            </div>
          )}
        </div>

        {/* Trade Stars */}
        <form action={setProfileTradeStars}>
          <div className="label mb-3">Trade Stars ⭐</div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="optIn"
              value="true"
              defaultChecked={profile.tradeStarsEnabled && connected}
              disabled={!connected}
              className="mt-1 w-4 h-4 accent-primary disabled:opacity-50"
            />
            <span className="text-[14px]">
              <span className="font-semibold">Trade stars with the cohort</span>
              <br />
              <span className="meta">
                Every repo post is auto-starred by everyone who opted in — and you
                star theirs. Needs GitHub connected to actually star. (Following
                peers is separate and always manual.)
              </span>
            </span>
          </label>
          <div className="flex justify-end mt-4">
            <SubmitButton className="btn btn-primary btn-sm">Save</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
