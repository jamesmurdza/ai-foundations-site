import Link from "@portal/components/Link";
import { requireUser } from "@portal/lib/auth";
import { getProfileByUserId } from "@portal/lib/queries";
import { onboardingGoals } from "@portal/lib/actions/profile";
import { OnboardingSteps } from "@portal/components/OnboardingSteps";
import { SubmitButton } from "@portal/components/SubmitButton";

export default async function OnboardingGoalsPage() {
  const user = await requireUser();
  const profile = await getProfileByUserId(user.id);

  return (
    <div className="container-page py-12 max-w-[640px]">
      <OnboardingSteps current={2} />
      <h1 className="text-[34px]">Your two goals</h1>
      <p className="meta mt-2 mb-7">
        These anchor your four weeks — you&apos;ll mark the second one achieved by
        the end.
      </p>
      <form action={onboardingGoals} className="card !p-7 space-y-5 fade-up">
        <div>
          <label className="label">Something you&apos;re proud of 🏅</label>
          <textarea
            className="textarea"
            name="proudOf"
            rows={3}
            defaultValue={profile?.proudOf ?? ""}
            placeholder="Something you've already done that you're proud of"
          />
        </div>
        <div>
          <label className="label">Something you want to achieve 🎯</label>
          <textarea
            className="textarea"
            name="wantToAchieve"
            rows={3}
            defaultValue={profile?.wantToAchieve ?? ""}
            placeholder="What you want to walk away with in 4 weeks"
          />
        </div>
        <div className="flex justify-between items-center">
          <Link href="/onboarding" className="link text-[14px]">← Back</Link>
          <SubmitButton className="btn btn-primary">Continue →</SubmitButton>
        </div>
      </form>
    </div>
  );
}
