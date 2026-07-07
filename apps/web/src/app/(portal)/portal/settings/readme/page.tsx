import { redirect } from "@portal/lib/nav";
import { getSessionContext } from "@portal/lib/auth";
import { loadReadmeForEdit } from "@portal/lib/actions/github-readme";
import { ReadmeEditor } from "@portal/components/ReadmeEditor";
import { withBase } from "@portal/lib/paths";

export default async function SettingsReadmePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const sp = await searchParams;
  const { user, profile } = await getSessionContext();
  if (!user) redirect("/login");
  if (!profile) redirect("/onboarding");

  const connected = Boolean(
    user.githubId && !String(user.githubId).startsWith("dev:"),
  );

  const readme =
    connected && user.githubLogin && user.accessToken
      ? await loadReadmeForEdit(user.githubLogin, user.accessToken)
      : null;

  const errorText: Record<string, string> = {
    no_github: "Connect GitHub to edit your README.",
    readme_forbidden: "GitHub denied write access — reconnect GitHub to grant permission.",
    readme_conflict: "Your README changed on GitHub since you opened this page — reload and try again.",
    readme_failed: "Could not save README to GitHub. Try again in a moment.",
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-heading">GitHub README</h2>
        <p className="meta">
          The README shown atop your GitHub profile and on your profile page here.
        </p>
      </div>

      {sp.saved === "1" && (
        <div className="mb-5 rounded-[11px] bg-ice-tint text-slate-channel text-[14px] px-4 py-3">
          README saved to GitHub.{" "}
          {user.githubLogin && (
            <a href={withBase(`/users/${user.githubLogin}`)} className="link font-semibold">
              View your profile →
            </a>
          )}
        </div>
      )}
      {sp.error && errorText[sp.error] && (
        <div className="mb-5 rounded-[11px] bg-primary-soft text-primary-strong text-[14px] px-4 py-3">
          {errorText[sp.error]}{" "}
          {(sp.error === "no_github" || sp.error === "readme_forbidden") && (
            <a href={withBase("/api/auth/github")} className="link font-semibold">
              {sp.error === "no_github" ? "Connect GitHub" : "Reconnect GitHub"}
            </a>
          )}
        </div>
      )}

      {connected && user.githubLogin && readme ? (
        <div className="fade-up">
          <ReadmeEditor
            login={user.githubLogin}
            initialMarkdown={readme.markdown}
            hasExisting={readme.hasExisting}
          />
        </div>
      ) : (
        <div>
          <p className="meta text-[15px]">
            Connect your GitHub account to write and sync your profile README from
            here.
          </p>
          <a href={withBase("/api/auth/github")} className="btn btn-dark mt-4">
            Connect GitHub
          </a>
        </div>
      )}
    </div>
  );
}
