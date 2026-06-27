import { redirect } from "@portal/lib/nav";

export default function PulseRedirect() {
  redirect("/discover?tab=activity");
}
