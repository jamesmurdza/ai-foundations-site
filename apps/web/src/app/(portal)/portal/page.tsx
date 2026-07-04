import { redirect } from "@portal/lib/nav";
import { getCurrentUser } from "@portal/lib/auth";
import { LoginView, type LoginSearchParams } from "@portal/components/LoginView";

// The portal's landing page is the sign-in experience — signed-in builders go
// straight to their home, everyone else gets the login card.
export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  if (await getCurrentUser()) redirect("/lessons");
  const sp = await searchParams;
  return <LoginView sp={sp} />;
}
