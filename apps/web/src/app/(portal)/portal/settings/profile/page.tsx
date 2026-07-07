import { redirect } from "@portal/lib/nav";
import { getSessionContext } from "@portal/lib/auth";
import {
  getApplicationById,
  findApplicationForUser,
  publicFieldsFromApplication,
} from "@portal/lib/applications";
import { updateProfile } from "@portal/lib/actions/profile";
import { SubmitButton } from "@portal/components/SubmitButton";
import { COUNTRY_CENTROIDS } from "@portal/lib/countries";

const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

export default async function SettingsProfilePage({
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
    <div>
      <div className="mb-6">
        <h2 className="text-heading">Profile</h2>
        <p className="meta">Your public info — name, location, bio and links.</p>
      </div>

      {sp.error === "username_taken" && (
        <div className="mb-5 rounded-[11px] bg-primary-soft text-primary-strong text-[14px] px-4 py-3">
          That @username is already taken — pick another.
        </div>
      )}
      {sp.saved === "1" && (
        <div className="mb-5 rounded-[11px] bg-ice-tint text-slate-channel text-[14px] px-4 py-3">
          Profile saved.
        </div>
      )}

      <form action={updateProfile} className="space-y-5 fade-up">
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

        {/* Private notes — kept for you (and onboarding); never shown on the profile. */}
        <div>
          <label className="label">🏅 Proud of</label>
          <textarea className="textarea" name="proudOf" rows={2} defaultValue={v.proudOf} />
        </div>
        <div>
          <label className="label">🎯 Excited by</label>
          <textarea className="textarea" name="wantToAchieve" rows={2} defaultValue={v.wantToAchieve} />
        </div>

        <div className="flex justify-end">
          <SubmitButton className="btn btn-primary">Save profile</SubmitButton>
        </div>
      </form>
    </div>
  );
}
