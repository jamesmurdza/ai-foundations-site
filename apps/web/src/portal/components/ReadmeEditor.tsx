"use client";

import "github-markdown-css/github-markdown-light.css";
import { useState, useTransition } from "react";
import {
  previewReadmeMarkdown,
  updateGithubReadme,
} from "@portal/lib/actions/github-readme";
import { SubmitButton } from "@portal/components/SubmitButton";

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
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [previewPending, startPreview] = useTransition();

  function showPreview() {
    startPreview(async () => {
      const html = await previewReadmeMarkdown(markdown);
      setPreviewHtml(html);
      setMode("preview");
    });
  }

  return (
    <div id="readme" className="rounded-cards border border-sea-fog p-4 space-y-4 scroll-mt-24">
      <div>
        <div className="label mb-1">GitHub profile README</div>
        <p className="meta text-[14px]">
          This is the README at the top of your GitHub profile. It&apos;s what
          people see on{" "}
          <span className="font-mono text-[13px]">/users/{login}</span> here
          too.
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("edit")}
          className={`pill ${mode === "edit" ? "bg-signal-blue text-white" : "bg-ice-tint text-slate-channel"}`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={showPreview}
          disabled={previewPending}
          className={`pill ${mode === "preview" ? "bg-signal-blue text-white" : "bg-ice-tint text-slate-channel"}`}
        >
          {previewPending ? "Rendering…" : "Preview"}
        </button>
        <a
          href={`https://github.com/${login}/${login}`}
          target="_blank"
          rel="noreferrer"
          className="pill bg-ice-tint text-slate-channel ml-auto"
        >
          View on GitHub →
        </a>
      </div>

      <form action={updateGithubReadme} className="space-y-4">
        {mode === "edit" ? (
          <textarea
            className="textarea font-mono text-[13px] min-h-[320px]"
            rows={16}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder={`# Hi, I'm ${login}\n\nTell the cohort who you are and what you're building…`}
          />
        ) : previewHtml ? (
          <div
            className="markdown-body rounded-cards border border-sea-fog p-4 bg-canvas-white overflow-auto max-h-[480px]"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <p className="meta">Could not render preview. Try again or save to GitHub.</p>
        )}

        <input type="hidden" name="markdown" value={markdown} />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="meta-light text-[13px]">
            Saves directly to GitHub — your profile page updates within a minute.
          </p>
          <SubmitButton className="btn btn-primary" pendingText="Saving…">
            Save to GitHub
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
