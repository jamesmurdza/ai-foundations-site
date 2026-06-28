"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { getSessionContext } from "@/lib/auth";
import {
  getProfileReadmeContents,
  renderMarkdownPreview,
  upsertProfileReadme,
} from "@/lib/github";

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
    redirect("/profile/edit?error=no_github#readme");
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
    redirect(`/profile/edit?error=${code}#readme`);
  }

  revalidateTag("github-readme", { expire: 0 });
  revalidatePath(`/users/${login}`);
  redirect("/profile/edit?saved=readme#readme");
}

export async function loadReadmeForEdit(login: string, token: string) {
  const contents = await getProfileReadmeContents(login, token);
  return {
    markdown: contents?.markdown ?? "",
    hasExisting: Boolean(contents),
  };
}
