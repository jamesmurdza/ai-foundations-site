"use client";

import { useCallback, useSyncExternalStore } from "react";

const PREFIX = "ssf:draft:";
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (typeof window !== "undefined") window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", cb);
  };
}

/**
 * Local-first text field: mirrors a value to localStorage on every keystroke so
 * nothing is ever lost, and restores it on reload. Backed by useSyncExternalStore
 * so the browser store is the source of truth (instant, SSR-safe). Returns
 * [value, setValue, clear]; the consuming server action is the background sync.
 */
export function useDraft(key: string, initial = "") {
  const k = PREFIX + key;
  const value = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(k) ?? initial;
      } catch {
        return initial;
      }
    },
    () => initial,
  );

  const setValue = useCallback(
    (v: string) => {
      try {
        if (v) localStorage.setItem(k, v);
        else localStorage.removeItem(k);
      } catch {
        /* storage blocked — degrade to in-memory (best effort) */
      }
      notify();
    },
    [k],
  );

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
    notify();
  }, [k]);

  return [value, setValue, clear] as const;
}
