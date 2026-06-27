import { redirect } from "next/navigation";

// The week overview is now the Check-in page (active week + switcher).
// Individual weeks are still served by /weeks/[id].
export default function WeeksRedirect() {
  redirect("/home");
}
