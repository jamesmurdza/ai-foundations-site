"use client";

import { useOptimistic } from "react";
import { checkIn } from "@portal/lib/actions/engagement";
import { SubmitButton } from "./SubmitButton";

/** Optimistic daily check-in: flips to "checked in" instantly, syncs after. */
export function CheckInButton({
  weekId,
  checkedIn,
}: {
  weekId: string;
  checkedIn: boolean;
}) {
  const [done, setDone] = useOptimistic(checkedIn);

  async function act(formData: FormData) {
    setDone(true);
    await checkIn(formData);
  }

  if (done) {
    return <span className="badge badge-teal" data-testid="checked-in">Checked in today ✓</span>;
  }

  return (
    <form action={act}>
      <input type="hidden" name="weekId" value={weekId} />
      <SubmitButton className="btn btn-primary btn-sm">Check in</SubmitButton>
    </form>
  );
}
