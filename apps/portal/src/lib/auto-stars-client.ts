export const AUTO_STARS_STORAGE_KEY = "ss:auto-stars-enabled";
export const AUTO_STARS_CHANGED_EVENT = "ss:auto-stars-changed";

export function readStoredAutoStars(): boolean | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(AUTO_STARS_STORAGE_KEY);
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export function persistAutoStars(enabled: boolean): void {
  window.localStorage.setItem(AUTO_STARS_STORAGE_KEY, String(enabled));
  window.dispatchEvent(
    new CustomEvent(AUTO_STARS_CHANGED_EVENT, { detail: { enabled } }),
  );
}
