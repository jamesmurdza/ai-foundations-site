"use client";

import "github-markdown-css/github-markdown-light.css";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { updateGithubReadme } from "@portal/lib/actions/github-readme";
import { SubmitButton } from "@portal/components/SubmitButton";

/**
 * Edits the user's GitHub profile README ({login}/{login}) with a live,
 * GitHub-flavored markdown preview beside the editor — rendered client-side with
 * react-markdown + remark-gfm (raw HTML is ignored, so no sanitising needed) and
 * styled with github-markdown-css. Saving writes straight to GitHub.
 */
export function ReadmeEditor({
  login,
  initialMarkdown,
  hasExisting,
}: {
  login: string;
  initialMarkdown: string;
  hasExisting: boolean;
}) {
  const [markdown, setMarkdown] = useState(initialMarkdown);

  return (
    <div id="readme" className="scroll-mt-24 space-y-4">
      <div>
        <div className="label mb-1">GitHub profile README</div>
        <p className="meta text-[14px]">
          Shown atop your GitHub profile and on{" "}
          <span className="font-mono text-[13px]">/users/{login}</span> here.
        </p>
      </div>

      {!hasExisting && !markdown.trim() && (
        <p className="meta text-[14px]">
          No README yet — write one here and we&apos;ll create your{" "}
          <strong>
            {login}/{login}
          </strong>{" "}
          repo.
        </p>
      )}

      <form action={updateGithubReadme} className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Write */}
          <div className="flex flex-col">
            <div className="meta-light text-[12px] font-semibold uppercase tracking-wide mb-1.5">
              Markdown
            </div>
            <textarea
              className="textarea font-mono text-[13px] min-h-[420px] flex-1"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder={`# Hi, I'm ${login}\n\nTell the cohort who you are and what you're building…`}
            />
          </div>

          {/* Live preview */}
          <div className="flex flex-col">
            <div className="meta-light text-[12px] font-semibold uppercase tracking-wide mb-1.5">
              Preview
            </div>
            <div className="markdown-body flex-1 min-h-[420px] max-h-[600px] overflow-auto rounded-cards border border-sea-fog bg-canvas-white p-4">
              {markdown.trim() ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
              ) : (
                <p className="meta">Nothing to preview yet.</p>
              )}
            </div>
          </div>
        </div>

        <input type="hidden" name="markdown" value={markdown} />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <a
            href={`https://github.com/${login}/${login}`}
            target="_blank"
            rel="noreferrer"
            className="link text-[13px]"
          >
            View on GitHub →
          </a>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="meta-light text-[13px]">
              Saves directly to GitHub — your profile updates within a minute.
            </p>
            <SubmitButton className="btn btn-primary" pendingText="Saving…">
              Save to GitHub
            </SubmitButton>
          </div>
        </div>
      </form>
    </div>
  );
}
