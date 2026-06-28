import { redirect } from "@portal/lib/nav";

export default function ProfilesRedirect() {
  redirect("/discover?tab=people");
}
