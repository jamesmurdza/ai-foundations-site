"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ArrowLeftToLine, Map as MapIcon } from "lucide-react";

// Lets the collapse button (rendered deep inside the server-composed map) reach
// the shell's state without threading a callback through the server boundary.
const CollapseContext = createContext<(() => void) | null>(null);

/** The collapse button that hides the map — an arrow tucking into a vertical
 *  line. Sits above the +/- zoom controls (rendered as the map's `topControl`). */
export function MapCollapseButton() {
  const collapse = useContext(CollapseContext);
  if (!collapse) return null;
  return (
    <button
      type="button"
      aria-label="Hide map"
      onClick={collapse}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-sea-fog bg-canvas-white text-midnight-harbor shadow-card-2 hover:bg-primary-soft"
    >
      <ArrowLeftToLine size={16} />
    </button>
  );
}

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
          className="btn btn-outline btn-sm fixed left-4 top-20 z-30 inline-flex cursor-pointer items-center gap-1.5 shadow-card-2"
        >
          <MapIcon size={16} /> Map
        </button>
        {feed}
      </div>
    );
  }

  return (
    <CollapseContext.Provider value={() => setCollapsed(true)}>
      {/* Break out of the page's narrow column to a near-full-width canvas. */}
      <div className="relative left-1/2 flex w-[calc(100vw-2rem)] -translate-x-1/2 flex-col gap-7 md:flex-row">
        {/* Map: sticks in view as the page scrolls, until the posts run out.
            top-[104px] matches the content's natural offset (nav + page
            padding) so the surrounding margin is constant and never scrolls. */}
        <div className="min-w-0 md:flex-1">
          <div className="h-[320px] md:sticky md:top-[104px] md:h-[calc(100vh-124px)]">
            {map}
          </div>
        </div>

        {/* Showcase timeline: scrolls as part of the page. */}
        <div className="shrink-0 md:w-[560px]">{feed}</div>
      </div>
    </CollapseContext.Provider>
  );
}
