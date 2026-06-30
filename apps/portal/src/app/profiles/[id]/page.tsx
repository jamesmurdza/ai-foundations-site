import { notFound, redirect } from "next/navigation";
import { getProfilePage, getLoginForProfileId } from "@/lib/queries";
import { loadProfileViewData } from "@/lib/profileViewData";
import { ProfileView } from "@/components/ProfileView";

// Legacy/canonicalizing profile route. If the owner has a GitHub login, this
// redirects to the canonical /users/[login]. Otherwise (no GitHub connected) it
// renders the curated profile in place — the graceful fallback, no README.
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const login = await getLoginForProfileId(id);
  if (login) redirect(`/users/${login}`);

  const page = await getProfilePage(id);
  if (!page) notFound();
  const data = await loadProfileViewData(page.profile, page.author);
  return <ProfileView {...data} />;
}
