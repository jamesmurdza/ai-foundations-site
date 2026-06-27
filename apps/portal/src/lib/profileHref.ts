/**
 * Canonical link to a participant's profile. Prefers the GitHub-mirror URL
 * /users/[githubusername]; falls back to the legacy /profiles/[id] for people
 * who haven't connected GitHub. Pure — safe to unit test.
 */
export function profileHref(a: {
  login?: string | null;
  profileId?: string | null;
}): string {
  if (a?.login) return `/users/${a.login}`;
  if (a?.profileId) return `/profiles/${a.profileId}`;
  return "/discover";
}
