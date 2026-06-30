"use client";

import { useEffect } from "react";
import { heartbeatPresence } from "@/lib/actions/engagement";

/** Pings presence so "who's watching" stays current. */
export function StreamPresence({ weekId }: { weekId: string }) {
  useEffect(() => {
    let active = true;
    const ping = () => {
      if (!active) return;
      heartbeatPresence(weekId).catch(() => {});
    };
    ping();
    const t = setInterval(ping, 25000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [weekId]);
  return null;
}
