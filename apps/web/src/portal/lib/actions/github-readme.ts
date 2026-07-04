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

/**
 * Where to send the user after saving. Defaults to the Settings README page (its
 * own ?saved / ?error handling). An embedder (e.g. the Week 1 flow) may pass an
 * internal `redirectTo` to stay in place; we only accept same-origin paths.
 */
function safeReturnTo(raw: FormDataEntryValue | null): string | null {
  const s = String(raw ?? "");
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  return null;
}

export async function updateGithubReadme(formData: FormData) {
  const { user } = await getSessionContext();
  if (!user) redirect("/login");
  const returnTo = safeReturnTo(formData.get("redirectTo"));
  if (!requireGithubWriteAccess(user)) {
    redirect(returnTo ?? "/settings/readme?error=no_github");
  }

  const markdown = String(formData.get("markdown") ?? "");
  const login = user.githubLogin!;
  const token = user.accessToken!;
  const existing = await getProfileReadmeContents(login, token);

  // Nothing to write: identical to what's on GitHub already, OR an empty editor
  // with no README yet (both sides ""). Skip the write entirely — this avoids
  // creating an empty `login/login` repo and avoids redundant no-diff commits —
  // and just continue to wherever the caller wanted to go.
  if (markdown.trim() === (existing?.markdown ?? "").trim()) {
    redirect(returnTo ?? "/settings/readme?saved=1");
  }

  const result = await upsertProfileReadme(
    login,
    token,
    markdown,
    existing?.sha,
  );

  if (!result.ok) {
    // Embedded editors just return to their page; Settings shows a coded error.
    if (returnTo) redirect(returnTo);
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
  redirect(returnTo ?? "/settings/readme?saved=1");
}

export async function loadReadmeForEdit(login: string, token: string) {
  const contents = await getProfileReadmeContents(login, token);
  return {
    markdown: contents?.markdown ?? "",
    hasExisting: Boolean(contents),
  };
}
