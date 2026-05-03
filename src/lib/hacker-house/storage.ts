"use client";

import { nanoid } from "nanoid";
import {
  applicationStateSchema,
  type ApplicationState,
} from "./types";

export const STORAGE_KEY = "aif_hh_app_v1";

export function loadState(): ApplicationState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return applicationStateSchema.parse(parsed);
  } catch {
    return null;
  }
}

export function saveState(state: ApplicationState): void {
  if (typeof window === "undefined") return;
  const next = { ...state, updatedAt: Date.now() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota or private mode — fail silently, DB sync still works once online */
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function newSessionId(): string {
  return nanoid(16);
}

export function freshState(): ApplicationState {
  return {
    sessionId: newSessionId(),
    answers: {},
    step: "intro",
    cardIndex: 0,
    status: "in_progress",
    updatedAt: Date.now(),
  };
}
