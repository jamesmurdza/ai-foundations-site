"use client";

import "github-markdown-css/github-markdown-light.css";
import { useRef, useState } from "react";
import {
  previewReadmeMarkdown,
  updateGithubReadme,
} from "@portal/lib/actions/github-readme";
import { SubmitButton } from "@portal/components/SubmitButton";

/**
 * Edits the user's GitHub profile README ({login}/{login}) with GitHub-style
 * Write / Preview tabs. The preview is rendered through GitHub's own /markdown
 * API (the same engine + sanitiser the profile README uses), so raw HTML,
 * badges, tables and alignment all render exactly as they will on the profile.
 * Saving writes straight to GitHub.
 */
export function ReadmeEditor({
  login,
  initialMarkdown,
  hasExisting,
  returnTo,
  saveLabel = "Save to GitHub",
  secondaryAction,
}: {
  login: string;
  initialMarkdown: string;
  hasExisting: boolean;
  /**
   * Where saving redirects back to. Defaults to the Settings README page; the
   * Week 1 flow passes its own path so saving stays on /home instead of bouncing
   * the user into settings.
   */
  returnTo?: string;
  /** Save button label — e.g. the Week 1 flow uses "Save & continue →". */
  saveLabel?: string;
  /** Optional control on the left of the footer row (e.g. a flow's Back button),
   *  so it lines up on the same line as the save button. */
  secondaryAction?: React.ReactNode;
}) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // Markdown the current preview was rendered from — skip re-fetching if unchanged.
  const renderedFor = useRef<string | null>(null);
  const reqId = useRef(0);

  async function showPreview() {
    setMode("preview");
    if (renderedFor.current === markdown) return;
    if (!markdown.trim()) {
      setPreviewHtml(null);
      renderedFor.current = markdown;
      return;
    }
    setPending(true);
    const id = ++reqId.current;
    const html = await previewReadmeMarkdown(markdown);
    if (id === reqId.current) {
      setPreviewHtml(html);
      renderedFor.current = markdown;
      setPending(false);
    }
  }

  const tab = (active: boolean) =>
    `px-4 py-2.5 text-[14px] font-semibold border-b-2 -mb-px cursor-pointer transition-colors ${
      active
        ? "border-signal-blue text-signal-blue"
        : "border-transparent text-slate-channel hover:text-midnight-harbor"
    }`;

  return (
    <div id="readme" className="scroll-mt-24 space-y-4">
      {!hasExisting && !markdown.trim() && (
        <p className="meta text-[14px]">
          No README yet — write one here and we&apos;ll create your{" "}
          <strong>
            {login}/{login}
          </strong>{" "}
          repo.
        </p>
      )}

      <div className="flex items-center gap-1 border-b border-sea-fog">
        <button type="button" onClick={() => setMode("write")} className={tab(mode === "write")}>
          Write
        </button>
        <button type="button" onClick={showPreview} className={tab(mode === "preview")}>
          {mode === "preview" && pending ? "Rendering…" : "Preview"}
        </button>
        <a
          href={`https://github.com/${login}/${login}`}
          target="_blank"
          rel="noreferrer"
          className="link text-[13px] ml-auto mr-1"
        >
          View on GitHub →
        </a>
      </div>

      <form action={updateGithubReadme} className="space-y-4">
        {mode === "write" ? (
          <textarea
            className="textarea font-mono text-[13px] min-h-[420px]"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder={`# Hi, I'm ${login}\n\nTell the cohort who you are and what you're building…`}
          />
        ) : (
          <div className="min-h-[420px] max-h-[640px] overflow-auto rounded-cards border border-sea-fog bg-canvas-white p-5">
            {pending ? (
              <p className="meta">Rendering preview…</p>
            ) : previewHtml ? (
              // Bound the rendered README to a centered content column like
              // GitHub's own `.markdown-body.container-lg`, so wide / unsized
              // images (badges, banners, SVGs, width="80%") don't stretch the
              // full column. The centering (mx-auto) lives on this wrapper, NOT
              // on `.markdown-body` — github-markdown-css sets
              // `.markdown-body { margin: 0 }`, which (same specificity, loaded
              // later) would otherwise cancel mx-auto and pin the column left.
              <div className="mx-auto max-w-[700px]">
                <div
                  className="markdown-body"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            ) : (
              <p className="meta">Nothing to preview yet.</p>
            )}
          </div>
        )}

        <input type="hidden" name="markdown" value={markdown} />
        {returnTo && (
          <input type="hidden" name="redirectTo" value={returnTo} />
        )}

        <div
          className={`flex items-center gap-3 flex-wrap ${
            secondaryAction ? "justify-between" : "justify-end"
          }`}
        >
          {secondaryAction}
          <SubmitButton className="btn btn-primary" pendingText="Saving…">
            {saveLabel}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
