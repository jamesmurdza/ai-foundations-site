import Link from "@portal/components/Link";
import { setStarTrade } from "@portal/lib/actions/submissions";

// "Star each other's repos" is the existing auto Trade Stars opt-in. Turning it
// on stars cohort repo posts and consents others to star yours — there is no
// per-repo button (by design). Reuses setStarTrade, which flips the profile flag.
export function TradeStarsCta({
  submissionId,
  enabled,
}: {
  submissionId: string;
  enabled: boolean;
}) {
  if (enabled) {
    return (
      <p className="meta mx-auto max-w-[44ch] text-center">
        <span className="font-semibold text-foreground">Trade Stars is on ⭐</span>{" "}
        — the cohort is starring your repo, and yours stars theirs.{" "}
        <Link href="/settings/account" className="link">
          Manage
        </Link>
      </p>
    );
  }
  return (
    <div className="mx-auto max-w-[44ch] text-center">
      <p className="meta mb-3">
        Turn on Trade Stars and everyone who opted in stars each other&apos;s
        showcased repos — all at once. The toggle is the consent.
      </p>
      <form action={setStarTrade} className="flex justify-center">
        <input type="hidden" name="submissionId" value={submissionId} />
        <input type="hidden" name="optIn" value="true" />
        <button className="btn btn-primary">Turn on Trade Stars ⭐</button>
      </form>
    </div>
  );
}
