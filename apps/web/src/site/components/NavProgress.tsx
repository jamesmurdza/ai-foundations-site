"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// A thin progress bar pinned to the top of the viewport. It appears the instant
// an internal link is clicked and completes when the new route commits.
//
// Why it exists: portal routes render on the server (force-dynamic), so there
// can be a beat between click and first paint. Without any feedback that beat
// reads as "nothing happened." This bar makes every click feel immediate,
// regardless of whether the target route was prefetched.
function NavProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // A change to this key means the navigation committed.
  const routeKey = `${pathname}?${searchParams.toString()}`;

  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(false);

  const ramp = useRef<ReturnType<typeof setInterval> | null>(null);
  const hide = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);
  const running = useRef(false);

  const stopTimers = useCallback(() => {
    if (ramp.current) clearInterval(ramp.current);
    if (safety.current) clearTimeout(safety.current);
    ramp.current = null;
    safety.current = null;
  }, []);

  const finish = useCallback(() => {
    if (!running.current) return;
    running.current = false;
    stopTimers();
    setWidth(100);
    if (hide.current) clearTimeout(hide.current);
    hide.current = setTimeout(() => {
      setActive(false);
      setWidth(0);
    }, 220);
  }, [stopTimers]);

  const start = useCallback(() => {
    running.current = true;
    if (hide.current) clearTimeout(hide.current);
    stopTimers();
    setActive(true);
    setWidth(8);
    // Ease toward 90% but never arrive — the route commit finishes the bar.
    ramp.current = setInterval(() => {
      setWidth((w) => (w >= 90 ? w : w + Math.max(0.5, (90 - w) * 0.12)));
    }, 200);
    // Safety net: never let the bar hang if a navigation is cancelled.
    safety.current = setTimeout(finish, 8000);
  }, [stopTimers, finish]);

  // Begin on any qualifying internal-link click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor || !anchor.getAttribute("href")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return; // external
      // Same page (or hash-only) — no navigation, so no bar.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return;
      start();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  // Route committed → complete the bar. Skip the initial mount.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    finish();
  }, [routeKey, finish]);

  // Tidy up any pending timers on unmount.
  useEffect(
    () => () => {
      stopTimers();
      if (hide.current) clearTimeout(hide.current);
    },
    [stopTimers],
  );

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: active ? 1 : 0,
        transition: "opacity 200ms ease",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: "var(--color-primary, #5b2bee)",
          boxShadow: "0 0 8px var(--color-primary, #5b2bee)",
          transition: "width 200ms ease",
        }}
      />
    </div>
  );
}

// useSearchParams must sit under a Suspense boundary so it never deopts the
// surrounding page out of static rendering.
export function NavProgress() {
  return (
    <Suspense fallback={null}>
      <NavProgressBar />
    </Suspense>
  );
}
