import { redirect } from "next/navigation";

export default function StarsRedirect() {
  redirect("/discover?tab=activity");
}
