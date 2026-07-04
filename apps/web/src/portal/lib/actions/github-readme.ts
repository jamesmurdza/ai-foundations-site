"use server";

import { redirect } from "@portal/lib/nav";
import { revalidatePath, revalidateTag } from "next/cache";
import { getSessionContext } from "@portal/lib/auth";
import {
  getProfileReadmeContents,
  renderMarkdownPreview,
  upsertProfileReadme,
} from "@portal/lib/github";

function requireGithubWriteAccess(user: {
  githubLogin: string | null;
  githubId: string | null;
  accessToken: string | null;
}) {
  if (
    !user.githubLogin ||
    !user.accessToken ||
    String(user.githubId ?? "").startsWith("dev:")
  ) {
    return false;
  }
  return true;
}

/**
 * Render markdown to HTML using GitHub's own /markdown API (+ the same
 * sanitiser as the profile README), so the editor's live preview matches the
 * rendered profile exactly — raw HTML, badges, tables and all.
 */
export async function previewReadmeMarkdown(
  markdown: string,
): Promise<string | null> {
  const { user } = await getSessionContext();
  if (!user || !requireGithubWriteAccess(user)) return null;
  return renderMarkdownPreview(markdown, user.accessToken ?? undefined);
}

export async function updateGithubReadme(formData: FormData) {
  const { user } = await getSessionContext();
  if (!user) redirect("/login");
  if (!requireGithubWriteAccess(user)) {
    redirect("/settings/readme?error=no_github");
  }

  const markdown = String(formData.get("markdown") ?? "");
  const login = user.githubLogin!;
  const token = user.accessToken!;
  const existing = await getProfileReadmeContents(login, token);

  const result = await upsertProfileReadme(
    login,
    token,
    markdown,
    existing?.sha,
  );

  if (!result.ok) {
    const code =
      result.code === "forbidden"
        ? "readme_forbidden"
        : result.code === "conflict"
          ? "readme_conflict"
          : "readme_failed";
    redirect(`/settings/readme?error=${code}`);
  }

  revalidateTag("github-readme", { expire: 0 });
  revalidatePath(`/users/${login}`);
  redirect("/settings/readme?saved=1");
}

export async function loadReadmeForEdit(login: string, token: string) {
  const contents = await getProfileReadmeContents(login, token);
  return {
    markdown: contents?.markdown ?? "",
    hasExisting: Boolean(contents),
  };
}
