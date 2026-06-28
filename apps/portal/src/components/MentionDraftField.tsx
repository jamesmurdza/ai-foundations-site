"use client";

import { useEffect, useRef } from "react";
import { MentionInput } from "./MentionInput";
import { useDraft } from "@/lib/draft";
import type { MentionPerson } from "@/lib/queries";

/**
 * Draft-saving textarea with @mention autocomplete — a drop-in for DraftField
 * where tagging people matters. Persists keystrokes to localStorage and clears
 * the draft just after submit (deferred so the Server Action still serializes
 * the typed value). Usable inside a Server Component <form>.
 */
export function MentionDraftField({
  draftKey,
  name,
  people,
  placeholder,
  required,
  className = "textarea",
  rows = 3,
}: {
  draftKey: string;
  name: string;
  people: MentionPerson[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  rows?: number;
}) {
  const [draft, setDraft, clearDraft] = useDraft(draftKey);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const form = wrapRef.current?.closest("form");
    if (!form) return;
    const onSubmit = () => setTimeout(() => clearDraft(), 0);
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [clearDraft]);

  return (
    <div ref={wrapRef}>
      <MentionInput
        multiline
        rows={rows}
        name={name}
        placeholder={placeholder}
        required={required}
        className={className}
        value={draft}
        onChange={setDraft}
        people={people}
      />
    </div>
  );
}
