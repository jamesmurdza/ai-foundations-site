"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ApplicationState } from "./types";

const DEBOUNCE_MS = 500;
const MAX_RETRIES = 3;

async function patchOnce(state: ApplicationState): Promise<Response> {
  return fetch(`/api/applications/sessions/${state.sessionId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(state),
  });
}

async function patchWithRetry(state: ApplicationState): Promise<void> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await patchOnce(state);
      if (res.ok) return;
      if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
        return;
      }
    } catch {
      /* network error — retry */
    }
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }
}

export function useDebouncedDbSync(
  state: ApplicationState,
  enabled: boolean,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(state);
  latest.current = state;

  useEffect(() => {
    if (!enabled) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void patchWithRetry(latest.current);
    }, DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state, enabled]);
}

export async function createSession(state: ApplicationState): Promise<void> {
  await fetch("/api/applications/sessions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(state),
  });
}

export async function generateDynamicQuestions(sessionId: string) {
  const res = await fetch(
    `/api/applications/sessions/${sessionId}/dynamic-questions`,
    { method: "POST" },
  );
  if (!res.ok) throw new Error(`Generate failed: ${res.status}`);
  return (await res.json()) as { questions: ApplicationState["dynamicQuestions"] };
}

export async function submitApplication(sessionId: string) {
  const res = await fetch(
    `/api/applications/sessions/${sessionId}/submit`,
    { method: "POST" },
  );
  if (!res.ok && res.status !== 409) {
    throw new Error(`Submit failed: ${res.status}`);
  }
  return res.status === 409 ? "already" : "ok";
}

export const syncImmediately = patchWithRetry;

export function useSyncOnUnload(
  state: ApplicationState,
  enabled: boolean,
) {
  const latest = useRef(state);
  latest.current = state;

  useCallback(() => {
    /* placeholder for ESLint */
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onBeforeUnload = () => {
      try {
        navigator.sendBeacon(
          `/api/applications/sessions/${latest.current.sessionId}`,
          new Blob([JSON.stringify(latest.current)], {
            type: "application/json",
          }),
        );
      } catch {
        /* best-effort */
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onBeforeUnload);
    };
  }, [enabled]);
}
