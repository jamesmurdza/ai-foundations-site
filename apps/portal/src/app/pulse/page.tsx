import { redirect } from "next/navigation";

export default function PulseRedirect() {
  redirect("/discover?tab=activity");
}
