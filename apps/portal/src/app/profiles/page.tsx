import { redirect } from "next/navigation";

export default function ProfilesRedirect() {
  redirect("/discover?tab=people");
}
