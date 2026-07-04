import { redirect } from "@portal/lib/nav";

// The old portal home page is gone — the lessons hub (/lessons) is the landing.
// Kept as a redirect so existing links (emails, auth callbacks) still resolve.
export default function HomeRedirect() {
  redirect("/lessons");
}
