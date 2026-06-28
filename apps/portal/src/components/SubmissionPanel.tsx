import { type ReactNode } from "react";

// The submission area — an optional heading + the submission form.
export function SubmissionPanel({
  form,
  heading = "Your work",
}: {
  form: ReactNode;
  heading?: string | null;
}) {
  return (
    <div>
      {heading && <h2 className="text-[20px] mb-4">{heading}</h2>}
      {form}
    </div>
  );
}
