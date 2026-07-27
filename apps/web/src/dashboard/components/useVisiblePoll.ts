"use client";

import { useEffect, useRef } from "react";
import { createPoller } from "@dashboard/lib/visible-poll";

/**
 * Poll `run` while the tab is visible, and refresh the moment it comes back.
 * `hiddenMs` keeps a slow poll alive out of view; null stops it dead. See
 * lib/visible-poll.ts for why background polling costs real money.
 */
export function useVisiblePoll(
  run: () => void,
  { visibleMs, hiddenMs }: { visibleMs: number; hiddenMs: number | null },
): void {
  // Keep the latest callback without restarting the poller each render.
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });

  useEffect(() => {
    const poller = createPoller({
      visibleMs,
      hiddenMs,
      isVisible: () => document.visibilityState === "visible",
      run: () => runRef.current(),
      timers: {
        setTimeout: (fn, ms) => window.setTimeout(fn, ms),
        clearTimeout: (id) => window.clearTimeout(id),
      },
    });
    poller.start();
    const onVisibility = () => poller.onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      poller.stop();
    };
  }, [visibleMs, hiddenMs]);
}
