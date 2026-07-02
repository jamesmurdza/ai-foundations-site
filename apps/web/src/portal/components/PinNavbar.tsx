"use client";

import { useEffect } from "react";

/**
 * Pins the top navbar as `fixed` for as long as this page is mounted, so it
 * never scrolls away (page-scoped via a body class; see `discover-nav-pinned`
 * in globals.css). Renders nothing.
 */
export function PinNavbar() {
  useEffect(() => {
    document.body.classList.add("discover-nav-pinned");
    return () => document.body.classList.remove("discover-nav-pinned");
  }, []);
  return null;
}
