import Link from "@portal/components/Link";
import { requireUser } from "@portal/lib/auth";
import { getProfileByUserId } from "@portal/lib/queries";
import {
  getApplicationById,
  findApplicationForUser,
  publicFieldsFromApplication,
} from "@portal/lib/applications";
import { onboardingDetails } from "@portal/lib/actions/profile";
import { OnboardingSteps } from "@portal/components/OnboardingSteps";
import { SubmitButton } from "@portal/components/SubmitButton";
import { COUNTRY_CENTROIDS } from "@portal/lib/countries";

const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await getProfileByUserId(user.id);
  // Match the application by the id we stored at sign-in first, then fall back to
  // email + GitHub login (covers people who applied with a different email).
  const application =
    (user.applicationId ? await getApplicationById(user.applicationId) : null) ??
    (await findApplicationForUser({
      email: user.email,
      githubLogin: user.githubLogin,
    }));
  const seed = application ? publicFieldsFromApplication(application) : null;

  const v = {
    displayName: profile?.displayName ?? seed?.displayName ?? user.name ?? "",
    country: profile?.country ?? seed?.country ?? "",
    city: profile?.city ?? "",
    bio: profile?.bio ?? "",
    publicEmail: profile?.publicEmail ?? seed?.publicEmail ?? user.email ?? "",
  };

  return (
    <div className="container-page py-12 max-w-[640px]">
      <OnboardingSteps current={1} />
      <h1 className="text-[34px]">Welcome — let&apos;s set you up</h1>
      <p className="meta mt-2 mb-2">
        You&apos;re signed in as{" "}
        <span className="font-semibold text-foreground">{user.email}</span>
        {application ? " — matched to your application ✓" : ""}.
      </p>
      {application && (
        <p className="meta-light text-[13px] mb-7">
          We pre-filled the public bits from your application. The full application
          stays a <Link href="/application" className="link">private archive</Link>.
        </p>
      )}

      <form action={onboardingDetails} className="card !p-7 space-y-5 fade-up">
        <div>
          <label className="label">Display name</label>
          <input className="input" name="displayName" defaultValue={v.displayName} required />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Country</label>
            <input className="input" name="country" list="countries" defaultValue={v.country} />
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
        <div className="flex justify-end">
          <SubmitButton className="btn btn-primary">Continue →</SubmitButton>
        </div>
      </form>
    </div>
  );
}
