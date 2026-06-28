import { redirect } from "next/navigation";

export default function MapRedirect() {
  redirect("/discover?tab=activity");
}
