"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A repo README preview clipped to a max height. When the content actually
 * overflows that height, a short fade-to-white at the bottom signals there's
 * more — mirroring how Instagram hints at a truncated caption. The fade is
 * suppressed when the content fits, so short READMEs get a clean edge.
 *
 * `full` renders the entire README with no clip and no fade — used once the
 * submission is opened (the modal / detail view), where there's room to read.
 */
export function SubmissionReadme({
  html,
  full = false,
}: {
  html: string;
  full?: boolean;
}) {
  const clipRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [clipped, setClipped] = useState(false);

  useEffect(() => {
    if (full) return; // full-length: nothing to measure or fade.
    const clip = clipRef.current;
    const content = contentRef.current;
    if (!clip || !content) return;
    // Compare the full (unconstrained) content height to the clipped viewport.
    const check = () => setClipped(content.offsetHeight - clip.clientHeight > 1);
    check();
    // Images load async (camo-proxied), growing the content — re-check then.
    const ro = new ResizeObserver(check);
    ro.observe(content);
    return () => ro.disconnect();
  }, [html, full]);

  if (full) {
    return (
      <div
        className="markdown-body p-5"
        style={{ fontSize: "13px" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="relative">
      <div ref={clipRef} className="max-h-[520px] overflow-hidden">
        <div
          ref={contentRef}
          className="markdown-body p-5"
          style={{ fontSize: "13px" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      {clipped && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-25 bg-gradient-to-t from-white to-transparent" />
      )}
    </div>
  );
}
