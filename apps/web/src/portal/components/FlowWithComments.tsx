"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { MessageCircle } from "lucide-react";

// Shared open/close state so the comment icon in a flow's header can toggle the
// comments panel that renders to the right of the flow content.
const CommentsCtx = createContext<{ open: boolean; toggle: () => void } | null>(
  null,
);

/**
 * The comment icon for a flow header (post-style: icon + count). Clicking it
 * opens the comments panel to the right of the content; clicking again collapses
 * it. Renders nothing outside a <FlowWithComments> (e.g. before first submit).
 */
export function CommentsToggleButton({ count }: { count: number }) {
  const ctx = useContext(CommentsCtx);
  if (!ctx) return null;
  return (
    <button
      type="button"
      onClick={ctx.toggle}
      aria-label={`Comments (${count})`}
      aria-expanded={ctx.open}
      className="inline-flex items-center gap-1.5 cursor-pointer hover:text-foreground"
    >
      <MessageCircle size={19} aria-hidden />
      {count > 0 && <span className="text-[13px] font-semibold">{count}</span>}
    </button>
  );
}

/**
 * Lays out a weekly flow with an optional, collapsible comments panel on the
 * right (like the comments on a submission post). Toggled by CommentsToggleButton
 * rendered in the flow's header.
 */
export function FlowWithComments({
  comments,
  children,
}: {
  /** The comments panel; when absent (no submission yet) there's nothing to open. */
  comments?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const showAside = open && Boolean(comments);

  return (
    <CommentsCtx.Provider value={{ open, toggle: () => setOpen((v) => !v) }}>
      <div
        className={
          showAside
            ? "grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"
            : ""
        }
      >
        <div className="min-w-0">{children}</div>
        {showAside && (
          <aside className="border-t border-border pt-5 lg:sticky lg:top-6 lg:border-t-0 lg:pt-0">
            {comments}
          </aside>
        )}
      </div>
    </CommentsCtx.Provider>
  );
}
