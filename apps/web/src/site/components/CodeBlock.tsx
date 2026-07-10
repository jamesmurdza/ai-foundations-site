"use client";
import { isValidElement, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

/** Recursively collect the text content of a (possibly highlighted) code node. */
function nodeToText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (isValidElement(node)) {
    return nodeToText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

/**
 * Custom renderer for fenced code blocks. Wraps the highlighted `<pre>` with a
 * language badge and a copy-to-clipboard button. Inline code is unaffected —
 * react-markdown only routes block code through the `pre` component.
 */
export function CodeBlock({
  children,
  ...preProps
}: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);

  const codeEl = isValidElement(children) ? children : null;
  const codeProps = (codeEl?.props ?? {}) as {
    className?: string;
    children?: ReactNode;
  };
  const match = /language-(\w+)/.exec(codeProps.className ?? "");
  const lang = match?.[1];
  const text = nodeToText(codeProps.children ?? children);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context); fail silently.
    }
  };

  return (
    <div className="group relative my-6">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
        {lang && (
          <span className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            {lang}
          </span>
        )}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="rounded bg-black/5 p-1 text-zinc-600 opacity-0 transition hover:bg-black/10 hover:text-zinc-900 focus-visible:opacity-100 group-hover:opacity-100"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <pre {...preProps}>{children}</pre>
    </div>
  );
}
