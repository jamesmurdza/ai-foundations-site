"use client";

import { useEffect, useState, useTransition } from "react";
import { setProfileTradeStars } from "@portal/lib/actions/profile";
import {
  AUTO_STARS_CHANGED_EVENT,
  AUTO_STARS_STORAGE_KEY,
  persistAutoStars,
} from "@portal/lib/auto-stars-client";
import { withBase } from "@portal/lib/paths";

export function AutoStarsToggle({
  initialEnabled,
  canToggle,
}: {
  initialEnabled: boolean;
  canToggle: boolean;
}) {
  // Server `initialEnabled` (profile.tradeStarsEnabled) is the source of truth;
  // localStorage only keeps multiple open tabs in visual sync.
  const [enabled, setEnabled] = useState(initialEnabled);
  const [syncError, setSyncError] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === AUTO_STARS_STORAGE_KEY) {
        setEnabled(event.newValue === "true");
      }
    }
    function onLocalChange(event: Event) {
      const detail = (event as CustomEvent<{ enabled?: boolean }>).detail;
      if (typeof detail?.enabled === "boolean") setEnabled(detail.enabled);
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTO_STARS_CHANGED_EVENT, onLocalChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTO_STARS_CHANGED_EVENT, onLocalChange);
    };
  }, []);

  function toggle() {
    if (!canToggle) return;
    const next = !enabled;
    setEnabled(next);
    setSyncError(false);
    persistAutoStars(next);

    startTransition(() => {
      const formData = new FormData();
      formData.set("optIn", String(next));
      void setProfileTradeStars(formData).catch(() => {
        // Keep the instant local UX; surface that cloud sync needs another click.
        setSyncError(true);
      });
    });
  }

  return (
    <div className="mx-auto flex max-w-[72ch] flex-col items-center gap-3 rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-ice-tint to-sky-50/80 px-5 py-4 shadow-sm">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={enabled ? "Turn off auto-stars" : "Turn on auto-stars for the cohort"}
        disabled={!canToggle}
        onClick={toggle}
        className={`group flex items-center gap-3 rounded-full px-3 py-2 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
          enabled
            ? "bg-signal-blue text-white"
            : "bg-white text-slate-channel ring-1 ring-signal-blue/20"
        }`}
      >
        <span
          className={`relative h-7 w-14 rounded-full transition ${
            enabled ? "bg-white/25" : "bg-slate-200"
          }`}
        >
          <span
            className={`absolute left-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-white text-[11px] shadow transition-transform ${
              enabled ? "translate-x-7 text-signal-blue" : "text-slate-400"
            }`}
          >
            ⭐
          </span>
        </span>
        <span>{enabled ? "Auto-stars on" : "Turn on auto-stars"}</span>
      </button>
      {canToggle ? (
        <p className="meta text-center">
          {enabled ? (
            <>
              You&apos;re showing love automatically: existing and new cohort GitHub
              repos get your star, and your repos join the same loop.
            </>
          ) : (
            <>
              Show love with one switch. Existing and new GitHub repo posts are
              automatically liked with your real GitHub star.
            </>
          )}
        </p>
      ) : (
        <p className="meta text-center">
          Auto-stars place your real GitHub star, so you need GitHub connected
          first.{" "}
          <a href={withBase("/api/auth/github")} className="link font-semibold">
            Connect GitHub
          </a>
          .
        </p>
      )}
      {syncError && (
        <p className="text-[13px] text-rose-600">
          Saved locally. Cloud sync did not finish; tap again to retry.
        </p>
      )}
    </div>
  );
}
