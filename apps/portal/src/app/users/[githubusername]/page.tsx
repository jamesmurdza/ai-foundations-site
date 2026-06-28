import { notFound } from "next/navigation";
import { getProfileByGithubLogin } from "@/lib/queries";
import { loadProfileViewData } from "@/lib/profileViewData";
import { ProfileView } from "@/components/ProfileView";
import { Readme } from "@/components/Readme";

// Canonical profile, served at /users/[githubusername]. Mirrors the person's
// GitHub profile by rendering their README as the centerpiece, wrapped in the
// portal rails (glow-up, projects, feedback, Follow).
export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ githubusername: string }>;
}) {
  const { githubusername } = await params;
  const login = decodeURIComponent(githubusername).replace(/^@/, "");
  const page = await getProfileByGithubLogin(login);
  if (!page) notFound();

  const data = await loadProfileViewData(page.profile, page.author);
  const readmeLogin = page.author.login ?? login;
  return <ProfileView {...data} readme={<Readme login={readmeLogin} />} />;
}
