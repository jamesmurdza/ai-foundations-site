import { redirect } from "@portal/lib/nav";

// The showcase now lives as a tab on the combined Discover page.
export default function ShowcaseRedirect() {
  redirect("/discover?tab=showcase");
}
