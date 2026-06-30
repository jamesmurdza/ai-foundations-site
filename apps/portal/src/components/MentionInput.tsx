"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";
import type { MentionPerson } from "@/lib/queries";

// Matches an in-progress "@handle" immediately before the caret. The handle may
// be empty (just after typing "@"). Anchored to start-of-string or whitespace so
// emails / mid-word @ don't trigger the picker.
const TRIGGER = /(?:^|\s)@([a-z0-9-]*)$/i;

/**
 * Text input with an @mention autocomplete. Type "@" and a filtered list of
 * people appears; pick one (click / ↑↓ + Enter) to insert "@username ".
 * Controlled — the parent owns the value (so drafts keep working).
 */
export function MentionInput({
  value,
  onChange,
  people,
  name,
  placeholder,
  required,
  className = "input",
  multiline = false,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  people: MentionPerson[];
  name?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const caretRef = useRef<number | null>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  const matches =
    query === null
      ? []
      : people
          .filter((p) => {
            const q = query.toLowerCase();
            return (
              p.username.toLowerCase().includes(q) ||
              (p.name ?? "").toLowerCase().includes(q)
            );
          })
          .slice(0, 6);
  const open = query !== null && matches.length > 0;

  // Restore the caret after a programmatic insert (controlled value re-render).
  useLayoutEffect(() => {
    if (caretRef.current !== null && ref.current) {
      ref.current.setSelectionRange(caretRef.current, caretRef.current);
      ref.current.focus();
      caretRef.current = null;
    }
  });

  function detect(text: string, caret: number) {
    const m = text.slice(0, caret).match(TRIGGER);
    setQuery(m ? m[1] : null);
    setActive(0);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    onChange(e.target.value);
    detect(e.target.value, e.target.selectionStart ?? e.target.value.length);
  }

  function pick(p: MentionPerson) {
    const caret = ref.current?.selectionStart ?? value.length;
    const before = value.slice(0, caret);
    const m = before.match(TRIGGER);
    if (!m) return;
    const at = (m.index ?? 0) + m[0].indexOf("@");
    const insert = `@${p.username} `;
    const next = value.slice(0, at) + insert + value.slice(caret);
    caretRef.current = at + insert.length;
    onChange(next);
    setQuery(null);
  }

  function onKeyDown(
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      pick(matches[active]);
    } else if (e.key === "Escape") {
      setQuery(null);
    }
  }

  const shared = {
    name,
    placeholder,
    required,
    value,
    className,
    onChange: handleChange,
    onKeyDown,
    onBlur: () => window.setTimeout(() => setQuery(null), 120),
    "aria-autocomplete": "list" as const,
  };

  return (
    <div className="relative flex-1">
      {multiline ? (
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          rows={rows}
          {...shared}
        />
      ) : (
        <input ref={ref as React.RefObject<HTMLInputElement>} {...shared} />
      )}

      {open && (
        <ul className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-2xl border border-border bg-card shadow-lg py-1">
          {matches.map((p, i) => (
            <li key={p.username}>
              <button
                type="button"
                // mousedown fires before blur, so the pick lands before close
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(p);
                }}
                onMouseEnter={() => setActive(i)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left ${
                  i === active ? "bg-primary-soft" : "hover:bg-muted"
                }`}
              >
                <Avatar src={p.avatarUrl} name={p.name ?? p.username} size={24} />
                <span className="font-medium text-[14px] truncate">
                  {p.name ?? p.username}
                </span>
                <span className="meta-light text-[13px] truncate">
                  @{p.username}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
