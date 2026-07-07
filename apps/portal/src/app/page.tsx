import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginView, type LoginSearchParams } from "@/components/LoginView";

// The portal's landing page is the sign-in experience — signed-in builders go
// straight to their home, everyone else gets the login card.
export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  if (await getCurrentUser()) redirect("/home");
  const sp = await searchParams;
  return <LoginView sp={sp} />;
}
