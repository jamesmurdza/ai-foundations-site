"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

/**
 * Instagram-web-style modal for viewing a submission without leaving the feed.
 * Rendered by the `@modal` intercepting route, so it only appears on soft
 * (client-side) navigation — a refresh or direct link hits the full page. It
 * closes by walking history back, which drops the intercepted URL and restores
 * the underlying feed exactly where it was.
 */
export function SubmissionModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => router.back(), [router]);

  // Escape closes; lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [close]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-8"
      onMouseDown={(e) => {
        // Backdrop click (not a click that started inside the dialog) closes.
        if (!dialogRef.current?.contains(e.target as Node)) close();
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="fixed right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
      >
        <X size={20} />
      </button>

      <div
        ref={dialogRef}
        className="my-auto w-full max-w-5xl rounded-lg border border-border bg-background p-5 shadow-xl sm:p-8"
      >
        {children}
      </div>
    </div>
  );
}
