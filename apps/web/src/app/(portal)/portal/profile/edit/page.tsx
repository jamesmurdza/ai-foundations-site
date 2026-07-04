import Link from "@portal/components/Link";
import { redirect } from "@portal/lib/nav";
import { getSessionContext } from "@portal/lib/auth";
import {
  getApplicationById,
  findApplicationForUser,
  publicFieldsFromApplication,
} from "@portal/lib/applications";
import { updateProfile, importGithubSocials } from "@portal/lib/actions/profile";
import { loadReadmeForEdit } from "@portal/lib/actions/github-readme";
import { withBase } from "@portal/lib/paths";
import { SubmitButton } from "@portal/components/SubmitButton";
import { ReadmeEditor } from "@portal/components/ReadmeEditor";
import { COUNTRY_CENTROIDS } from "@portal/lib/countries";

const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

export default async function ProfileEditPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const sp = await searchParams;
  const { user, profile } = await getSessionContext();
  if (!user) redirect("/login");
  if (!profile) redirect("/onboarding");

  // Fall back to the application for any socials still empty (helps people whose
  // profile predates the autofill fix).
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

  const readme =
    connected && user.githubLogin && user.accessToken
      ? await loadReadmeForEdit(user.githubLogin, user.accessToken)
      : null;

  const v = {
    username: profile.username ?? "",
    displayName: profile.displayName ?? user.name ?? "",
    country: profile.country ?? "",
    city: profile.city ?? "",
    bio: profile.bio ?? "",
    publicEmail: profile.publicEmail ?? user.email ?? "",
    githubUrl: profile.githubUrl ?? seed?.githubUrl ?? "",
    siteUrl: profile.siteUrl ?? seed?.siteUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    xUrl: profile.xUrl ?? "",
    proudOf: profile.proudOf ?? "",
    wantToAchieve: profile.wantToAchieve ?? "",
  };

  return (
    <div className="container-page py-10 max-w-[680px]">
      <div className="flex items-center justify-between">
        <h1 className="text-[34px]">Edit your profile</h1>
        <Link href={`/profiles/${profile.id}`} className="link text-[14px]">
          View profile →
        </Link>
      </div>

      {sp.error === "username_taken" && (
        <div className="mt-5 rounded-[11px] bg-primary-soft text-primary-strong text-[14px] px-4 py-3">
          That @username is already taken — pick another.
        </div>
      )}
      {sp.saved === "readme" && (
        <div className="mt-5 rounded-[11px] bg-ice-tint text-slate-channel text-[14px] px-4 py-3">
          README saved to GitHub.{" "}
          {user.githubLogin && (
            <Link href={`/users/${user.githubLogin}`} className="link font-semibold">
              View your profile →
            </Link>
          )}
        </div>
      )}
      {sp.error === "readme_forbidden" && (
        <div className="mt-5 rounded-[11px] bg-primary-soft text-primary-strong text-[14px] px-4 py-3">
          GitHub denied write access.{" "}
          <a href={withBase("/api/auth/github")} className="link font-semibold">
            Reconnect GitHub
          </a>{" "}
          to grant permission.
        </div>
      )}
      {sp.error === "readme_conflict" && (
        <div className="mt-5 rounded-[11px] bg-primary-soft text-primary-strong text-[14px] px-4 py-3">
          Your README changed on GitHub since you opened this page — reload and try again.
        </div>
      )}
      {sp.error === "readme_failed" && (
        <div className="mt-5 rounded-[11px] bg-primary-soft text-primary-strong text-[14px] px-4 py-3">
          Could not save README to GitHub. Try again in a moment.
        </div>
      )}

      <form action={updateProfile} className="card !p-7 space-y-5 mt-6 fade-up">
        <div>
          <label className="label">Username</label>
          <div className="flex items-center gap-2">
            <span className="meta-light text-[18px]">@</span>
            <input
              className="input"
              name="username"
              defaultValue={v.username}
              placeholder="yourname"
              pattern="[a-zA-Z0-9\-]+"
              maxLength={24}
            />
          </div>
          <p className="meta-light text-[12px] mt-1">
            Your shareable link: aifoundations.school/portal/u/
            <span className="font-semibold">{v.username || "yourname"}</span>
          </p>
        </div>

        <div>
          <label className="label">Display name</label>
          <input className="input" name="displayName" defaultValue={v.displayName} required />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Country</label>
            <input className="input" name="country" list="countries" defaultValue={v.country} />
            {!v.country && (
              <p className="meta-light text-[13px] mt-1.5">
                Add your country to appear on the cohort map.
              </p>
            )}
            <datalist id="countries">
              {Object.keys(COUNTRY_CENTROIDS).map((c) => (
                <option key={c} value={cap(c)} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" name="city" defaultValue={v.city} />
          </div>
        </div>

        <div>
          <label className="label">Short bio</label>
          <textarea className="textarea" name="bio" rows={2} defaultValue={v.bio} />
        </div>

        <div>
          <label className="label">Public email</label>
          <input className="input" type="email" name="publicEmail" defaultValue={v.publicEmail} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">GitHub</label>
            <input className="input" name="githubUrl" defaultValue={v.githubUrl} placeholder="https://github.com/you" />
          </div>
          <div>
            <label className="label">Website / portfolio</label>
            <input className="input" name="siteUrl" defaultValue={v.siteUrl} />
          </div>
          <div>
            <label className="label">LinkedIn</label>
            <input className="input" name="linkedinUrl" defaultValue={v.linkedinUrl} />
          </div>
          <div>
            <label className="label">X / Twitter</label>
            <input className="input" name="xUrl" defaultValue={v.xUrl} />
          </div>
        </div>

        <div>
          <label className="label">🏅 Proud of</label>
          <textarea className="textarea" name="proudOf" rows={2} defaultValue={v.proudOf} />
        </div>
        <div>
          <label className="label">🎯 Excited by</label>
          <textarea className="textarea" name="wantToAchieve" rows={2} defaultValue={v.wantToAchieve} />
        </div>

        {/* GitHub connection */}
        <div className="rounded-2xl border border-sea-fog p-4">
          <div className="label mb-2">GitHub connection</div>
          {connected ? (
            <div className="flex items-center gap-3 flex-wrap">
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
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="meta text-[14px]">
                Connect to enable Trade Stars and your GitHub glow-up.
              </div>
              <a href={withBase("/api/auth/github")} className="btn btn-dark">Connect GitHub</a>
            </div>
          )}
        </div>

        {/* Global trade-stars toggle */}
        <label className="flex items-start gap-3 cursor-pointer rounded-2xl bg-ice-tint p-4">
          <input
            type="checkbox"
            name="tradeStarsEnabled"
            defaultChecked={profile.tradeStarsEnabled && connected}
            disabled={!connected}
            className="mt-1 w-4 h-4 accent-primary disabled:opacity-50"
          />
          <span className="text-[14px]">
            <span className="font-semibold">Trade stars with the cohort ⭐</span>
            <br />
            <span className="meta">
              Every repo post is auto-starred by everyone who opted in — and you
              star theirs. Needs GitHub connected to actually star. (Following
              peers is separate and always manual.)
            </span>
          </span>
        </label>

        <div className="flex justify-end">
          <SubmitButton className="btn btn-primary">Save profile</SubmitButton>
        </div>
      </form>

      {connected && user.githubLogin && readme && (
        <div className="card !p-7 mt-6 fade-up">
          <ReadmeEditor
            login={user.githubLogin}
            initialMarkdown={readme.markdown}
            hasExisting={readme.hasExisting}
          />
        </div>
      )}
    </div>
  );
}
