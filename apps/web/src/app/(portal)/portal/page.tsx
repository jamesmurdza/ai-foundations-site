import { redirect } from "@portal/lib/nav";
import { getCurrentUser } from "@portal/lib/auth";

export default async function PortalIndex() {
  // No landing page — go straight to sign-in (or home if already signed in).
  if (await getCurrentUser()) redirect("/home");
  redirect("/login");
}
