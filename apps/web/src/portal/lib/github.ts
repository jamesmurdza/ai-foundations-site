import "server-only";
import { unstable_cache } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { normalizeUrl } from "./github-parse";
import { unwrapReadmeImageUrls, readmeGist } from "./readme-html";
import { classifyStarResponse, type StarOutcome } from "./star-throttle";
import type { ProfileSignals } from "./gitwitTypes";
export { parseRepo, parseLogin, deriveRepoRef } from "./github-parse";
export type { RepoRef } from "./github-parse";

const API = "https://api.github.com";
const UA = "ai-foundations-portal";

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": UA,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/** API headers with optional auth — anonymous when no token (public reads). */
function readHeaders(token?: string, accept = "application/vnd.github+json") {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: accept,
    "User-Agent": UA,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function starRepo(
  token: string,
  owner: string,
  repo: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API}/user/starred/${owner}/${repo}`, {
      method: "PUT",
      headers: { ...headers(token), "Content-Length": "0" },
    });
    if (res.status === 204) return { ok: true };
    return { ok: false, error: `star ${res.status}` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function unstarRepo(
  token: string,
  owner: string,
  repo: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API}/user/starred/${owner}/${repo}`, {
      method: "DELETE",
      headers: headers(token),
    });
    if (res.status === 204 || res.status === 404) return { ok: true };
    return { ok: false, error: `unstar ${res.status}` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * Star a repo for the reconciler — same call as `starRepo`, but returns a
 * rate-limit-aware {@link StarOutcome} (reads Retry-After / x-ratelimit headers
 * so the throttled reconciler can back off and reschedule). Interactive single
 * clicks keep using `starRepo`.
 */
export async function starRepoThrottled(
  token: string,
  owner: string,
  repo: string,
): Promise<StarOutcome> {
  try {
    const res = await fetch(`${API}/user/starred/${owner}/${repo}`, {
      method: "PUT",
      headers: { ...headers(token), "Content-Length": "0" },
    });
    return classifyStarResponse(res.status, res.headers);
  } catch (e) {
    return { ok: false, status: 0, error: (e as Error).message };
  }
}

export async function followUser(
  token: string,
  login: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API}/user/following/${login}`, {
      method: "PUT",
      headers: { ...headers(token), "Content-Length": "0" },
    });
    if (res.status === 204) return { ok: true };
    return { ok: false, error: `follow ${res.status}` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function unfollowUser(
  token: string,
  login: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API}/user/following/${login}`, {
      method: "DELETE",
      headers: headers(token),
    });
    if (res.status === 204) return { ok: true };
    return { ok: false, error: `unfollow ${res.status}` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Authoritative follow check against GitHub (204 = following, 404 = not). */
export async function isFollowing(
  token: string,
  login: string,
): Promise<boolean | null> {
  try {
    const res = await fetch(`${API}/user/following/${login}`, {
      headers: headers(token),
    });
    if (res.status === 204) return true;
    if (res.status === 404) return false;
    return null;
  } catch {
    return null;
  }
}

/* ---- Profile socials (extract from the GitHub profile) ------------------- */

export type GithubSocials = {
  website: string | null;
  linkedin: string | null;
  twitter: string | null;
};

/**
 * Pull the public links a user already lists on their GitHub profile: the
 * website (`blog`), and the "social accounts" they've added (LinkedIn, X, …).
 * All public, read-only — safe to import into the portal profile.
 */
export async function getGithubSocials(
  login: string,
  token?: string,
): Promise<GithubSocials> {
  const out: GithubSocials = { website: null, linkedin: null, twitter: null };
  try {
    const u = await fetch(`${API}/users/${login}`, {
      headers: readHeaders(token),
      next: { revalidate: 600 },
    });
    if (u.ok) {
      const j = (await u.json()) as {
        blog?: string | null;
        twitter_username?: string | null;
      };
      if (j.blog) out.website = normalizeUrl(j.blog);
      if (j.twitter_username) out.twitter = `https://x.com/${j.twitter_username}`;
    }
    const s = await fetch(`${API}/users/${login}/social_accounts`, {
      headers: readHeaders(token),
      next: { revalidate: 600 },
    });
    if (s.ok) {
      const accounts = (await s.json()) as { provider: string; url: string }[];
      for (const a of accounts) {
        if (a.provider === "linkedin" && !out.linkedin) out.linkedin = a.url;
        else if (a.provider === "twitter" && !out.twitter) out.twitter = a.url;
        else if (a.provider === "generic" && !out.website)
          out.website = normalizeUrl(a.url);
      }
    }
  } catch {
    // best-effort; return whatever we gathered
  }
  return out;
}

/* ---- Profile README (mirror the user's GitHub profile) ------------------- */

// Defense-in-depth sanitize of GitHub's already-rendered, already-sanitized
// README HTML. We KEEP the markup + author sizing GitHub emits so the result is
// a faithful mirror: `class` (for github-markdown-css), `align`, and `style`
// limited to safe sizing props (this is how author <img style="height:25px">
// icons stay icon-sized, exactly like GitHub).
const SIZE = [/^\d+(?:\.\d+)?(?:px|em|rem|%)?$/];
const README_SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "picture",
    "source",
    "details",
    "summary",
    "del",
    "ins",
    "mark",
    "kbd",
    "sup",
    "sub",
    "abbr",
    "figure",
    "figcaption",
    "input", // task-list checkboxes
    "video",
    "h1",
    "h2",
  ]),
  allowedAttributes: {
    "*": ["align", "class", "id", "title", "dir", "style"],
    a: ["href", "name", "target", "rel", "aria-hidden"],
    img: ["src", "srcset", "alt", "width", "height", "align", "loading", "style", "referrerpolicy"],
    source: ["srcset", "media", "type", "sizes"],
    input: ["type", "checked", "disabled"],
    ol: ["start", "type"],
    video: ["src", "controls", "width", "height", "poster"],
  },
  // Only sizing + alignment styles survive — no positioning/background/etc.
  allowedStyles: {
    "*": {
      height: SIZE,
      width: SIZE,
      "max-width": SIZE,
      "max-height": SIZE,
      "text-align": [/^(?:left|right|center)$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  // Open external links safely; never let README markup hijack the tab.
  transformTags: {
    a: sanitizeHtml.simpleTransform(
      "a",
      { rel: "noreferrer nofollow", target: "_blank" },
      true,
    ),
  },
};

export function sanitizeReadmeHtml(html: string): string {
  return sanitizeHtml(unwrapReadmeImageUrls(html), README_SANITIZE);
}

/**
 * A user's profile README rendered EXACTLY as GitHub renders it on the repo
 * page — via the readme endpoint's HTML media type, which (unlike the generic
 * /markdown API) preserves author image sizing and resolves relative/image URLs
 * to camo. Sanitized, then styled with github-markdown-css for a true mirror.
 * Cached per login (public, identical for everyone) so each login hits GitHub
 * at most ~once / 10 min. Optional GITHUB_TOKEN for rate-limit headroom; falls
 * back to anonymous. Returns null when the user has no profile README.
 */
export const getRenderedReadmeHtml = unstable_cache(
  async (login: string): Promise<string | null> => {
    const token = process.env.GITHUB_TOKEN || undefined;
    try {
      const res = await fetch(`${API}/repos/${login}/${login}/readme`, {
        headers: readHeaders(token, "application/vnd.github.html+json"),
      });
      if (res.status !== 200) return null;
      return sanitizeReadmeHtml(await res.text());
    } catch {
      return null;
    }
  },
  ["profile-readme-html"],
  { tags: ["github-readme"], revalidate: 600 },
);

/**
 * Any repo's README rendered EXACTLY as GitHub renders it — same HTML media
 * type as {@link getRenderedReadmeHtml}, but for an arbitrary owner/name so the
 * showcase feed can show real GitHub-flavored markdown (headings, code, tables,
 * images) instead of a plain-text gist. Sanitized and cached per repo.
 */
export const getRepoReadmeHtml = unstable_cache(
  async (owner: string, name: string): Promise<string | null> => {
    const token = process.env.GITHUB_TOKEN || undefined;
    try {
      const res = await fetch(`${API}/repos/${owner}/${name}/readme`, {
        headers: readHeaders(token, "application/vnd.github.html+json"),
      });
      if (res.status !== 200) return null;
      return sanitizeReadmeHtml(await res.text());
    } catch {
      return null;
    }
  },
  ["repo-readme-html"],
  { tags: ["github-readme"], revalidate: 3600 },
);

/**
 * A short plain-text gist of any repo's README for the showcase feed preview.
 * Cached per repo (public, identical for everyone); uses GITHUB_TOKEN for
 * rate-limit headroom so a feed of repos doesn't exhaust the anonymous quota.
 * Returns null when the repo has no README or the fetch fails.
 */
export const getRepoReadmeGist = unstable_cache(
  async (owner: string, name: string): Promise<string | null> => {
    const token = process.env.GITHUB_TOKEN || undefined;
    try {
      const res = await fetch(`${API}/repos/${owner}/${name}/readme`, {
        headers: readHeaders(token, "application/vnd.github.raw"),
      });
      if (res.status !== 200) return null;
      const gist = readmeGist(await res.text());
      return gist || null;
    } catch {
      return null;
    }
  },
  // key bumped to v2 — gist formatting changed (entity decoding), so old cached
  // gists must be recomputed rather than served stale for up to revalidate.
  ["repo-readme-gist", "v2"],
  { tags: ["github-readme"], revalidate: 3600 },
);

export type GithubStats = {
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
};

/** Snapshot a user's public GitHub stats for the glow-up tracker. */
export async function getGithubStats(
  login: string,
  token?: string,
): Promise<GithubStats | null> {
  try {
    const h = token
      ? headers(token)
      : { Accept: "application/vnd.github+json", "User-Agent": "ai-foundations-portal" };
    const userRes = await fetch(`${API}/users/${login}`, { headers: h });
    if (!userRes.ok) return null;
    const u = (await userRes.json()) as {
      public_repos: number;
      followers: number;
      following: number;
    };

    // Sum stargazers across the first two pages of owned repos (cap cost).
    let totalStars = 0;
    for (let page = 1; page <= 2; page++) {
      const reposRes = await fetch(
        `${API}/users/${login}/repos?per_page=100&page=${page}&type=owner&sort=updated`,
        { headers: h },
      );
      if (!reposRes.ok) break;
      const repos = (await reposRes.json()) as { stargazers_count: number }[];
      totalStars += repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
      if (repos.length < 100) break;
    }

    return {
      publicRepos: u.public_repos ?? 0,
      followers: u.followers ?? 0,
      following: u.following ?? 0,
      totalStars,
    };
  } catch {
    return null;
  }
}

/* ---- GitWit review inputs (profile basics, README markdown, pinned) ------- */

/** Name / bio / avatar from the public profile — fields GitWit reasons over. */
export async function getGithubProfileBasics(
  login: string,
  token?: string,
): Promise<{ name: string | null; bio: string | null; avatarUrl: string | null } | null> {
  try {
    const res = await fetch(`${API}/users/${login}`, {
      headers: readHeaders(token),
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const j = (await res.json()) as {
      name?: string | null;
      bio?: string | null;
      avatar_url?: string | null;
    };
    return {
      name: j.name ?? null,
      bio: j.bio ?? null,
      avatarUrl: j.avatar_url ?? null,
    };
  } catch {
    return null;
  }
}

/** Raw markdown of the profile README (username/username repo), or null. */
export async function getProfileReadmeMarkdown(
  login: string,
  token?: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${API}/repos/${login}/${login}/readme`, {
      headers: readHeaders(token, "application/vnd.github.raw"),
      next: { revalidate: 600 },
    });
    if (res.status !== 200) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export type ReadmeContents = {
  markdown: string;
  sha: string;
};

/** Fetch README.md body + SHA for in-portal editing. Requires user token. */
export async function getProfileReadmeContents(
  login: string,
  token: string,
): Promise<ReadmeContents | null> {
  try {
    const res = await fetch(`${API}/repos/${login}/${login}/contents/README.md`, {
      headers: readHeaders(token),
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const j = (await res.json()) as {
      content?: string;
      sha?: string;
      encoding?: string;
    };
    if (!j.content || !j.sha) return null;
    const markdown =
      j.encoding === "base64"
        ? Buffer.from(j.content.replace(/\n/g, ""), "base64").toString("utf8")
        : j.content;
    return { markdown, sha: j.sha };
  } catch {
    return null;
  }
}

export type GithubWriteResult =
  | { ok: true }
  | { ok: false; error: string; code?: "forbidden" | "conflict" | "not_connected" };

const README_MAX_BYTES = 100 * 1024;

/** Create the public profile repo if it doesn't exist yet. */
export async function ensureProfileRepo(
  login: string,
  token: string,
): Promise<GithubWriteResult> {
  try {
    const check = await fetch(`${API}/repos/${login}/${login}`, {
      headers: readHeaders(token),
    });
    if (check.status === 200) return { ok: true };
    if (check.status !== 404) {
      return { ok: false, error: `repo check ${check.status}` };
    }
    const res = await fetch(`${API}/user/repos`, {
      method: "POST",
      headers: { ...headers(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: login,
        description: `${login}'s GitHub profile README`,
        private: false,
        auto_init: true,
      }),
    });
    if (res.status === 201 || res.status === 422) return { ok: true };
    if (res.status === 403) return { ok: false, error: "GitHub denied repo creation", code: "forbidden" };
    return { ok: false, error: `create repo ${res.status}` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Create or update the profile README on GitHub. */
export async function upsertProfileReadme(
  login: string,
  token: string,
  markdown: string,
  sha?: string | null,
): Promise<GithubWriteResult> {
  const bytes = Buffer.byteLength(markdown, "utf8");
  if (bytes > README_MAX_BYTES) {
    return { ok: false, error: "README is too large (max 100KB)" };
  }

  const ensured = await ensureProfileRepo(login, token);
  if (!ensured.ok) return ensured;

  let fileSha = sha;
  if (!fileSha) {
    const current = await getProfileReadmeContents(login, token);
    fileSha = current?.sha ?? null;
  }

  try {
    const body: Record<string, string> = {
      message: fileSha
        ? "Update profile README via AI Foundations Portal"
        : "Create profile README via AI Foundations Portal",
      content: Buffer.from(markdown, "utf8").toString("base64"),
    };
    if (fileSha) body.sha = fileSha;

    const res = await fetch(`${API}/repos/${login}/${login}/contents/README.md`, {
      method: "PUT",
      headers: { ...headers(token), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 200 || res.status === 201) return { ok: true };
    if (res.status === 403) {
      return { ok: false, error: "Reconnect GitHub to grant write access", code: "forbidden" };
    }
    if (res.status === 409) {
      return {
        ok: false,
        error: "README changed on GitHub — reload and try again",
        code: "conflict",
      };
    }
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || `update readme ${res.status}` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Render markdown via GitHub for editor preview. */
export async function renderMarkdownPreview(
  markdown: string,
  token?: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${API}/markdown`, {
      method: "POST",
      headers: {
        ...readHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: markdown, mode: "gfm" }),
    });
    if (!res.ok) return null;
    return sanitizeReadmeHtml(await res.text());
  } catch {
    return null;
  }
}

/** Pinned repositories via GraphQL (needs a token — best-effort, [] otherwise). */
export async function getPinnedRepos(
  login: string,
  token?: string,
): Promise<{ name: string; description: string | null }[]> {
  if (!token) return [];
  try {
    const query = `query($login:String!){ user(login:$login){ pinnedItems(first:6, types:[REPOSITORY]){ nodes{ ... on Repository { name description } } } } }`;
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": UA,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { login } }),
    });
    if (!res.ok) return [];
    const j = (await res.json()) as {
      data?: {
        user?: {
          pinnedItems?: { nodes?: { name?: string; description?: string | null }[] };
        };
      };
    };
    const nodes = j.data?.user?.pinnedItems?.nodes ?? [];
    return nodes
      .filter((n): n is { name: string; description: string | null } => Boolean(n?.name))
      .map((n) => ({ name: n.name, description: n.description ?? null }));
  } catch {
    return [];
  }
}

/**
 * Gather everything GitWit needs for one login in parallel. `userToken` (the
 * viewer's own OAuth token) authorises the GraphQL pinned-repos query; reads
 * fall back to `GITHUB_TOKEN` or anonymous.
 */
export async function gatherProfileSignals(
  login: string,
  userToken?: string | null,
): Promise<ProfileSignals> {
  const token = userToken || process.env.GITHUB_TOKEN || undefined;
  const [basics, socials, readmeMarkdown, pinnedRepos] = await Promise.all([
    getGithubProfileBasics(login, token),
    getGithubSocials(login, token),
    getProfileReadmeMarkdown(login, token),
    getPinnedRepos(login, token),
  ]);
  return {
    login,
    name: basics?.name ?? null,
    bio: basics?.bio ?? null,
    avatarUrl: basics?.avatarUrl ?? null,
    website: socials.website,
    linkedin: socials.linkedin,
    twitter: socials.twitter,
    pinnedRepos,
    readmeMarkdown,
  };
}
