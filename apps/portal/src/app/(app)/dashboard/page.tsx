import { redirect } from "next/navigation";

// The dashboard has been folded into the weekly Check-in page. Keep this route
// as a redirect so old links and bookmarks still land somewhere sensible.
export default function DashboardPage() {
  redirect("/home");
}
