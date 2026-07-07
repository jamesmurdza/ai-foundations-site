import Link from "@portal/components/Link";

// Shown once a wizard-week assignment is submitted: a congrats message pointing
// to the showcase, with a link back into the full page to edit. Copy defaults to
// Week 1 (GitHub profile); pass title/message to reuse for other weeks.
export function SubmittedCongrats({
  showcaseHref,
  editHref,
  weekLabel,
  title = "You're all set!",
  message = "Your GitHub profile is submitted — see what everyone's building.",
}: {
  showcaseHref: string;
  editHref: string;
  /** Centered "Week N: Theme" eyebrow above the congrats title. */
  weekLabel?: string;
  title?: string;
  message?: string;
}) {
  return (
    <div className="text-center pt-10 pb-2">
      {weekLabel && (
        <p className="text-[13px] font-medium text-slate-channel/60 mb-1">
          {weekLabel}
        </p>
      )}
      <h2 className="text-heading-lg mb-2">{title}</h2>
      <p className="meta mb-6">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href={editHref} className="btn btn-outline">
          Edit submission
        </Link>
        <Link href={showcaseHref} className="btn btn-primary">
          See the showcase →
        </Link>
      </div>
    </div>
  );
}
