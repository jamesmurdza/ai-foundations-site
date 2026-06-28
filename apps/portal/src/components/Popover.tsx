"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// A small icon-triggered popover panel (click-outside / Escape to close).
// Used for the comments and questions panels in page headers.
// `icon` is a rendered element (e.g. <MessageSquare size={19} />) so this
// client component never receives a component function across the RSC boundary.
export function Popover({
  icon,
  label,
  count,
  width = 360,
  children,
}: {
  icon: ReactNode;
  label: string;
  count?: number;
  width?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={count != null ? `${label} (${count})` : label}
        className="relative grid place-items-center w-9 h-9 text-slate-channel hover:text-foreground cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
      >
        {icon}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute right-0 mt-2 card !p-4 z-50 max-w-[calc(100vw-2rem)] max-h-[70vh] overflow-y-auto"
          style={{ width, boxShadow: "var(--shadow-card)" }}
        >
          <div className="font-semibold text-[15px] mb-3">{label}</div>
          {children}
        </div>
      )}
    </div>
  );
}
