/** Pure GitHub URL parsing — no server-only deps, safe to unit test. */

export type RepoRef = { owner: string; repo: string };

/** Parse owner/repo from any github URL or `owner/repo` string. */
export function parseRepo(input: string | null | undefined): RepoRef | null {
  if (!input) return null;
  const s = input.trim();
  const m =
    s.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/i) ||
    s.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
}

export function parseLogin(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.trim();
  const m = s.match(/github\.com\/([^/\s#?]+)/i) || s.match(/^@?([\w-]+)$/);
  return m ? m[1] : null;
}

/**
 * The starrable GitHub repo for a submission payload. A repo link (or
 * `owner/repo` shorthand) → that repo; a bare GitHub *profile* link
 * (`github.com/<login>`) → the profile README repo `<login>/<login>`; anything
 * else (non-GitHub link, plain text, a bare word) → null. This is what the
 * auto-star reconciler stars and what the feed heart targets.
 */
export function deriveRepoRef(input: string | null | undefined): RepoRef | null {
  const repo = parseRepo(input);
  if (repo) return repo;
  // Only a real github.com profile link becomes <login>/<login>; never a bare
  // word (which parseLogin would otherwise accept) — that would falsely mark a
  // text submission as a starrable repo.
  if (input && /github\.com\//i.test(input)) {
    const login = parseLogin(input);
    if (login) return { owner: login, repo: login };
  }
  return null;
}

/**
 * Normalize a URL-ish string into an absolute https URL. GitHub's `blog` field
 * is often scheme-less ("burhankhatri.com"); social links are usually full.
 * Returns null for empty input. Pure — safe to unit test.
 */
export function normalizeUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.trim();
  if (!s) return null;
  if (/^(?:https?:|mailto:)/i.test(s)) return s;
  return `https://${s.replace(/^\/+/, "")}`;
}

export type ProfileSubmissionCheck =
  | { ok: true; login: string }
  | {
      ok: false;
      reason: "empty" | "not_github" | "not_yours" | "wrong_repo";
      message: string;
    };

/**
 * Strictly validate that a Week-1 submission is the viewer's OWN GitHub profile
 * (or profile-README) link, before GitWit spends a review on it. Accepts the
 * profile URL (`github.com/me`), the profile-README repo (`github.com/me/me`),
 * the README file URL, or a bare username. Rejects non-GitHub links, someone
 * else's profile, and links to a specific non-profile repo — each with a
 * GitWit-voiced, actionable message. `ownLogin` is the viewer's GitHub login;
 * when null (e.g. dev login) ownership can't be checked, but structure still is.
 */
export function validateProfileSubmission(
  payload: string | null | undefined,
  ownLogin?: string | null,
  opts?: { allowAnyOwner?: boolean },
): ProfileSubmissionCheck {
  const s = (payload ?? "").trim();
  const example = ownLogin ? `https://github.com/${ownLogin}` : "https://github.com/yourname";

  if (!s) {
    return { ok: false, reason: "empty", message: "Paste your GitHub profile's README link first." };
  }

  const login = parseLogin(s);
  if (!login) {
    return {
      ok: false,
      reason: "not_github",
      message: `That doesn't look like a GitHub profile link. You're meant to submit your own GitHub profile's README link — for example, ${example}.`,
    };
  }

  if (
    !opts?.allowAnyOwner &&
    ownLogin &&
    login.toLowerCase() !== ownLogin.toLowerCase()
  ) {
    return {
      ok: false,
      reason: "not_yours",
      message: `That link points to @${login}'s profile, not yours. You're meant to submit your own GitHub profile's README link: ${example}.`,
    };
  }

  const repo = parseRepo(s);
  if (repo && repo.repo.toLowerCase() !== repo.owner.toLowerCase()) {
    return {
      ok: false,
      reason: "wrong_repo",
      message: `That links to a specific repo (${repo.owner}/${repo.repo}), not your profile README. Your profile README lives at ${repo.owner}/${repo.owner} — submit https://github.com/${repo.owner} instead.`,
    };
  }

  return { ok: true, login };
}
