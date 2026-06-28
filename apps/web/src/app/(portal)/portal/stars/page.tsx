import { redirect } from "@portal/lib/nav";

export default function StarsRedirect() {
  redirect("/discover?tab=activity");
}
