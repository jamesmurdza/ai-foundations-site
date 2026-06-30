import { redirect } from "@portal/lib/nav";
import { getCurrentUser } from "@portal/lib/auth";
import { LoginView, type LoginSearchParams } from "@portal/components/LoginView";

// Legacy sign-in route. The landing page (`/`) is now the login experience; this
// stays as a working alias so OAuth callbacks and `requireUser()` redirects to
// `/login` keep landing on the sign-in card.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  if (await getCurrentUser()) redirect("/home");
  const sp = await searchParams;
  return <LoginView sp={sp} />;
}
