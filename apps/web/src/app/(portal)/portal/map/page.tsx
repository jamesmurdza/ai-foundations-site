import { redirect } from "@portal/lib/nav";

export default function MapRedirect() {
  redirect("/discover?tab=activity");
}
