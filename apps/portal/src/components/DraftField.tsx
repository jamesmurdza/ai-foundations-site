"use client";

import { useEffect, useRef } from "react";

const PREFIX = "ssf:draft:";

/**
 * Drop-in <input>/<textarea> that auto-saves to the browser as you type and
 * restores on reload. Uncontrolled on purpose: the DOM value is always what
 * gets submitted, so clearing the saved draft can never race a Server Action's
 * FormData serialization. Usable inside a Server Component <form>.
 */
export function DraftField({
  draftKey,
  name,
  className,
  placeholder,
  required,
  clearOnSubmit = true,
  textarea = false,
  rows,
}: {
  draftKey: string;
  name: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  clearOnSubmit?: boolean;
  textarea?: boolean;
  rows?: number;
}) {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const k = PREFIX + draftKey;

  // Restore a saved draft after mount (SSR renders empty → no hydration drift).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    try {
      const saved = localStorage.getItem(k);
      if (saved != null && el.value === "") el.value = saved;
    } catch {
      /* storage blocked */
    }
  }, [k]);

  // On submit: drop the saved draft, and clear the field *after* the action has
  // read the form (deferred so serialization keeps the typed value).
  useEffect(() => {
    if (!clearOnSubmit) return;
    const form = ref.current?.form;
    if (!form) return;
    const onSubmit = () => {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        if (ref.current) ref.current.value = "";
      }, 0);
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [k, clearOnSubmit]);

  const onInput = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.currentTarget.value;
    try {
      if (v) localStorage.setItem(k, v);
      else localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  };

  const props = { ref, name, onInput, className, placeholder, required };
  return textarea ? <textarea {...props} rows={rows} /> : <input {...props} />;
}
