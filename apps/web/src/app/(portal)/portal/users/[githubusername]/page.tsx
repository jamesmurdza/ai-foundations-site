import { notFound } from "@portal/lib/nav";
import { getProfileByGithubLogin } from "@portal/lib/queries";
import { loadProfileViewData } from "@portal/lib/profileViewData";
import { ProfileView } from "@portal/components/ProfileView";
import { Readme } from "@portal/components/Readme";

// Canonical profile, served at /users/[githubusername]. Mirrors the person's
// GitHub profile by rendering their README as the centerpiece, wrapped in the
// portal rails (glow-up, projects, feedback, Follow).
export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ githubusername: string }>;
}) {
  const { githubusername } = await params;
  const login = decodeURIComponent(githubusername).replace(/^@portal/, "");
  const page = await getProfileByGithubLogin(login);
  if (!page) notFound();

  const data = await loadProfileViewData(page.profile, page.author);
  // Source the README from the Week 1 submission when present (see loader), else
  // the GitHub username; fall back to the route login as a last resort.
  const readmeLogin = data.readmeLogin ?? login;
  return <ProfileView {...data} readme={<Readme login={readmeLogin} />} />;
}
