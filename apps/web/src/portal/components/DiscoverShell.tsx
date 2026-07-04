"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeftToLine, Map as MapIcon } from "lucide-react";

/**
 * The combined Discover layout: the world map on the left and the showcase
 * timeline on the right. The timeline scrolls with the page while the map
 * sticks in view until you reach the end of the posts (then the footer shows).
 * Collapsing hides the map, centers the timeline, and leaves a floating "Map"
 * button on the left to bring it back.
 */
export function DiscoverShell({ map, feed }: { map: ReactNode; feed: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="btn btn-outline btn-sm fixed left-6 top-20 z-30 inline-flex cursor-pointer items-center gap-1.5"
        >
          <MapIcon size={16} /> Map
        </button>
        {feed}
      </div>
    );
  }

  return (
    /* Break out of the page's narrow column to a near-full-width canvas. */
    <div className="relative left-1/2 flex w-[calc(100vw-52px)] -translate-x-1/2 flex-col gap-7 md:-mt-[10px] md:gap-[23px] md:flex-row">
      {/* Map: sticks in view as the page scrolls, until the posts run out.
          top-[94px] matches the content's natural offset (nav + page padding,
          less the 10px pulled up above) so the margin is constant and never
          scrolls; ml gives it a little breathing room on the left. */}
      <div className="min-w-0 md:ml-[10px] md:flex-1">
        <div className="relative h-[320px] md:sticky md:top-[94px] md:h-[calc(100vh-119px)]">
          {map}
          {/* Collapse button — hides the map. Sits above the map's +/- zoom
              stack (the map reserves the top slot for it via reserveTopControl).
              Rendered here in the client shell so it can drive the collapse
              state directly, with no context threading across the server-
              rendered map. */}
          <button
            type="button"
            aria-label="Hide map"
            onClick={() => setCollapsed(true)}
            className="absolute right-3 top-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-sea-fog bg-canvas-white text-midnight-harbor shadow-card-2 hover:bg-primary-soft"
          >
            <ArrowLeftToLine size={16} />
          </button>
        </div>
      </div>

      {/* Showcase timeline: scrolls as part of the page. */}
      <div className="shrink-0 md:w-[560px]">{feed}</div>
    </div>
  );
}
