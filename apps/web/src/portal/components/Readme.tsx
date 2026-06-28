import "github-markdown-css/github-markdown-light.css";
import { getRenderedReadmeHtml } from "@portal/lib/github";

/**
 * Renders a participant's GitHub profile README as the centerpiece of their
 * portal profile — a faithful mirror: GitHub's own repo-page HTML inside a
 * `.markdown-body` styled with github-markdown-css. Returns null when there's
 * no README so the caller can fall back to the curated hero.
 */
export async function Readme({ login }: { login: string }) {
  const html = await getRenderedReadmeHtml(login);
  if (!html) return null;
  // GitHub's HTML is already wrapped in <article class="markdown-body">, which
  // github-markdown-css styles — render it directly (no extra wrapper).
  return (
    <article className="card !p-7">
      <div className="label mb-4">
        <a
          href={`https://github.com/${login}`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-primary"
        >
          GitHub profile · @{login}
        </a>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
