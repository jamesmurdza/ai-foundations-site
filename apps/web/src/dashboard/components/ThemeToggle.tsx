"use client";

import { useCallback, useEffect, useState } from "react";

type ThemeChoice = "system" | "light" | "dark";

const STORAGE_KEY = "hh:theme";

function resolveSystem(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(choice: ThemeChoice): void {
  if (typeof document === "undefined") return;
  const resolved = choice === "system" ? resolveSystem() : choice;
  document.documentElement.dataset.theme = resolved;
}

function readStoredChoice(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch {
    /* ignore */
  }
  return "system";
}

export function ThemeToggle() {
  // Lazy initialiser runs once per mount. On the server it returns "system"
  // (placeholder); on the client it returns the real stored value. We rely on
  // suppressHydrationWarning below because that's exactly the kind of safe
  // SSR/CSR difference React shouldn't fight us about.
  const [choice, setChoice] = useState<ThemeChoice>(readStoredChoice);

  // Keep this tab in sync with any other open tab that changes the theme.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      const next =
        e.newValue === "light" || e.newValue === "dark" || e.newValue === "system"
          ? (e.newValue as ThemeChoice)
          : "system";
      setChoice(next);
      applyTheme(next);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Follow the OS while the user is on "system".
  useEffect(() => {
    if (choice !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [choice]);

  // Reconcile the DOM with state on every change (covers both clicks and the
  // storage listener) so the document attribute can't drift.
  useEffect(() => {
    applyTheme(choice);
  }, [choice]);

  const cycle = useCallback(() => {
    setChoice((prev) => {
      const next: ThemeChoice =
        prev === "system" ? "light" : prev === "light" ? "dark" : "system";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const label =
    choice === "system" ? "System" : choice === "light" ? "Light" : "Dark";
  const title = `Theme: ${label} — click to change`;

  return (
    <button
      type="button"
      onClick={cycle}
      title={title}
      aria-label={title}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-hairline bg-canvas text-ink-80 transition-colors hover:border-ink/30 hover:text-ink"
      suppressHydrationWarning
    >
      <Icon choice={choice} />
    </button>
  );
}

function Icon({ choice }: { choice: ThemeChoice }) {
  if (choice === "light") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }
  if (choice === "dark") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
      </svg>
    );
  }
  // system
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
