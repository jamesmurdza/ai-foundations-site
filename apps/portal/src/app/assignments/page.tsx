import { redirect } from "next/navigation";

// Assignments are surfaced inside the weekly Check-in page now.
// Canonical assignment URLs: /home?week=<id>#assignment
export default function AssignmentsRedirect() {
  redirect("/home");
}
