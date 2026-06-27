"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label = "Copy link",
  className = "btn btn-outline btn-sm",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* ignore */
        }
      }}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
