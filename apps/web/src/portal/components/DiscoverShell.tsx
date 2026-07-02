"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ArrowLeft, Map as MapIcon } from "lucide-react";

// Lets the collapse button (rendered deep inside the server-composed map) reach
// the shell's state without threading a callback through the server boundary.
const CollapseContext = createContext<(() => void) | null>(null);

/** The circular left-arrow button that hides the map; sits above the +/- zoom
 *  controls. Rendered as the map's `topControl`. */
export function MapCollapseButton() {
  const collapse = useContext(CollapseContext);
  if (!collapse) return null;
  return (
    <button
      type="button"
      aria-label="Hide map"
      onClick={collapse}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-sea-fog bg-canvas-white text-midnight-harbor shadow-card-2 hover:bg-primary-soft"
    >
      <ArrowLeft size={16} />
    </button>
  );
}

/**
 * The combined Discover layout: the world map on the left and the showcase
 * timeline on the right. Collapsing hides the map entirely, centers the
 * timeline, and leaves a "Map" button in the corner to bring it back.
 */
export function DiscoverShell({ map, feed }: { map: ReactNode; feed: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="btn btn-outline btn-sm absolute left-0 top-0 z-10 inline-flex items-center gap-1.5"
        >
          <MapIcon size={16} /> Map
        </button>
        <div className="pt-12">{feed}</div>
      </div>
    );
  }

  return (
    <CollapseContext.Provider value={() => setCollapsed(true)}>
      {/* Break out of the page's narrow column to a wide canvas. */}
      <div className="relative left-1/2 flex w-[min(1280px,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-6 md:h-[calc(100vh-9rem)] md:flex-row">
        {/* Map: fills the page height, pan/zoom instead of scrolling. */}
        <div className="h-[320px] min-w-0 md:h-full md:flex-1">{map}</div>

        {/* Showcase timeline: scrolls independently on the right. */}
        <div className="shrink-0 md:h-full md:w-[560px] md:overflow-y-auto md:pr-1">
          {feed}
        </div>
      </div>
    </CollapseContext.Provider>
  );
}
