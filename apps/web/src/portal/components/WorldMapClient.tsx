"use client";

import { useEffect, useRef, useState } from "react";

export type CountryPath = { d: string; fill: string; name: string; count: number };
export type Dot = { cx: number; cy: number; n: number; name: string };
export type PersonDot = {
  id: string;
  cx: number;
  cy: number;
  avatarUrl: string | null;
  name: string;
  href: string;
  location: string;
  initials: string;
};

type HoverCountry = { kind: "country"; name: string; count: number };
type HoverPerson = { kind: "person"; name: string; location: string };
type Hover = HoverCountry | HoverPerson;

// A restrained, map-like palette on the site's indigo theme: a near-white
// backdrop (the "water") with land in the signal-blue used for avatar
// placeholder initials.
const OCEAN = "#f7f8fa";
const LAND = "#a892f2";
const LAND_STROKE = "#8f78ec";
const LAND_HOVER = "#8064e8";

export function WorldMapClient({
  paths,
  dots,
  personDots = [],
  mode = "aggregate",
  width,
  height,
  total,
}: {
  paths: CountryPath[];
  dots: Dot[];
  personDots?: PersonDot[];
  mode?: "aggregate" | "people";
  width: number;
  height: number;
  total: number;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  // Pan/zoom lives in refs so dragging doesn't re-render the (heavy) map.
  const view = useRef({ s: 1, tx: 0, ty: 0 });
  const drag = useRef<
    null | { vx: number; vy: number; tx0: number; ty0: number; moved: boolean }
  >(null);
  const movedRef = useRef(false);
  const [hover, setHover] = useState<Hover | null>(null);
  const peopleMode = mode === "people";
  const dotRadius = peopleMode ? 12 : 0;

  function move(e: React.MouseEvent) {
    const tip = tipRef.current;
    const wrap = wrapRef.current;
    if (!tip || !wrap) return;
    const r = wrap.getBoundingClientRect();
    tip.style.transform = `translate3d(${e.clientX - r.left + 12}px, ${e.clientY - r.top + 12}px, 0)`;
  }

  // Screen coords → SVG viewBox coords (accounts for viewBox + letterboxing).
  function toView(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }

  function apply() {
    const g = gRef.current;
    if (g) {
      const { tx, ty, s } = view.current;
      g.setAttribute("transform", `translate(${tx} ${ty}) scale(${s})`);
    }
  }

  // Wheel-to-zoom, anchored on the cursor. Native listener so preventDefault
  // works (React's onWheel is passive).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = toView(e.clientX, e.clientY);
      if (!p) return;
      const f = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const s2 = Math.min(8, Math.max(1, view.current.s * f));
      const rf = s2 / view.current.s;
      view.current.tx = p.x - rf * (p.x - view.current.tx);
      view.current.ty = p.y - rf * (p.y - view.current.ty);
      view.current.s = s2;
      apply();
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    const p = toView(e.clientX, e.clientY);
    if (!p) return;
    drag.current = {
      vx: p.x,
      vy: p.y,
      tx0: view.current.tx,
      ty0: view.current.ty,
      moved: false,
    };
    movedRef.current = false;
    setHover(null);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (drag.current) {
      const p = toView(e.clientX, e.clientY);
      if (!p) return;
      const dx = p.x - drag.current.vx;
      const dy = p.y - drag.current.vy;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) drag.current.moved = true;
      view.current.tx = drag.current.tx0 + dx;
      view.current.ty = drag.current.ty0 + dy;
      apply();
    } else {
      move(e);
    }
  }

  function onPointerUp() {
    if (drag.current) movedRef.current = drag.current.moved;
    drag.current = null;
  }

  // Zoom via the on-map +/- buttons, anchored on the frame's center.
  function zoomBy(factor: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const p = toView(r.left + r.width / 2, r.top + r.height / 2);
    if (!p) return;
    const s2 = Math.min(8, Math.max(1, view.current.s * factor));
    const rf = s2 / view.current.s;
    view.current.tx = p.x - rf * (p.x - view.current.tx);
    view.current.ty = p.y - rf * (p.y - view.current.ty);
    view.current.s = s2;
    apply();
  }

  return (
    <div className="relative h-full">
      <div
        ref={wrapRef}
        className="relative h-full overflow-hidden rounded-[14px] border border-border"
        style={{ background: OCEAN }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid slice"
          className="block h-full w-full cursor-grab touch-none active:cursor-grabbing"
          role="img"
          aria-label="World map of where the cohort is from"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={() => {
            onPointerUp();
            setHover(null);
          }}
          onClickCapture={(e) => {
            // Swallow the click that ends a drag so person links don't navigate.
            if (movedRef.current) {
              e.preventDefault();
              e.stopPropagation();
              movedRef.current = false;
            }
          }}
        >
          <g ref={gRef}>
            <g style={{ stroke: LAND_STROKE }}>
              {paths.map((p, i) => (
                <path
                  key={i}
                  d={p.d}
                  fill={
                    hover?.kind === "country" && hover.name === p.name
                      ? LAND_HOVER
                      : LAND
                  }
                  strokeWidth={0.5}
                  strokeLinejoin="round"
                  onMouseEnter={(e) => {
                    if (drag.current) return;
                    setHover({ kind: "country", name: p.name, count: p.count });
                    move(e);
                  }}
                />
              ))}
            </g>

            <defs>
              <radialGradient id="ss-blip" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6d43f0" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#6d43f0" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6d43f0" stopOpacity="0" />
              </radialGradient>
              {personDots.map((p) => (
                <clipPath key={`clip-${p.id}`} id={`avatar-clip-${p.id}`}>
                  <circle cx={p.cx} cy={p.cy} r={dotRadius} />
                </clipPath>
              ))}
            </defs>

            {!peopleMode && (
              <g pointerEvents="none">
                {dots.map((d, i) => (
                  <g key={`d-${i}`}>
                    <circle
                      className="map-ring"
                      cx={d.cx}
                      cy={d.cy}
                      r={7}
                      fill="url(#ss-blip)"
                      style={{ animationDelay: `${(i % 8) * 0.18}s` }}
                    />
                    <circle cx={d.cx} cy={d.cy} r={2.4} fill="#4c24c6" />
                  </g>
                ))}
              </g>
            )}

            {peopleMode && (
              <g>
                {personDots.map((p) => (
                  <a key={p.id} href={p.href} aria-label={p.name}>
                    <g
                      onMouseEnter={(e) => {
                        if (drag.current) return;
                        setHover({ kind: "person", name: p.name, location: p.location });
                        move(e);
                      }}
                    >
                      {p.avatarUrl ? (
                        <image
                          href={p.avatarUrl}
                          x={p.cx - dotRadius}
                          y={p.cy - dotRadius}
                          width={dotRadius * 2}
                          height={dotRadius * 2}
                          clipPath={`url(#avatar-clip-${p.id})`}
                          preserveAspectRatio="xMidYMid slice"
                        />
                      ) : (
                        <>
                          <circle
                            cx={p.cx}
                            cy={p.cy}
                            r={dotRadius}
                            fill="var(--ice-tint, #eef2ff)"
                          />
                          <text
                            x={p.cx}
                            y={p.cy}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="var(--signal-blue, #5b2bee)"
                            fontSize={10}
                            fontWeight={700}
                            pointerEvents="none"
                          >
                            {p.initials}
                          </text>
                        </>
                      )}
                      <circle
                        cx={p.cx}
                        cy={p.cy}
                        r={dotRadius}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth={2}
                        pointerEvents="none"
                      />
                    </g>
                  </a>
                ))}
              </g>
            )}
          </g>
        </svg>

        {/* Zoom controls */}
        <div className="absolute right-3 top-3 z-10 flex flex-col overflow-hidden rounded-[10px] border border-sea-fog bg-canvas-white shadow-card-2">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => zoomBy(1.3)}
            className="flex h-8 w-8 items-center justify-center text-[18px] leading-none text-midnight-harbor hover:bg-primary-soft"
          >
            +
          </button>
          <span className="h-px w-full bg-sea-fog" aria-hidden />
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => zoomBy(1 / 1.3)}
            className="flex h-8 w-8 items-center justify-center text-[18px] leading-none text-midnight-harbor hover:bg-primary-soft"
          >
            −
          </button>
        </div>

        {total === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center">
            <p className="meta">
              As the cohort grows, the map lights up across the globe.
            </p>
          </div>
        )}
      </div>

      {/* Tooltip lives outside the clipped frame so it can spill past the
          rounded border instead of being cut off at the edges. */}
      <div
        ref={tipRef}
        className="pointer-events-none absolute left-0 top-0 z-20 rounded-[10px] border border-sea-fog bg-canvas-white px-3 py-1.5 text-[12px] shadow-card-2"
        style={{ visibility: hover ? "visible" : "hidden" }}
      >
        {hover?.kind === "person" ? (
          <>
            <div className="font-semibold text-midnight-harbor">{hover.name}</div>
            <div className="meta-light">{hover.location || "Cohort member"}</div>
          </>
        ) : (
          <>
            <div className="font-semibold text-midnight-harbor">{hover?.name}</div>
            <div className="meta-light">
              {hover && hover.kind === "country" && hover.count > 0
                ? `${hover.count} ${hover.count === 1 ? "builder" : "builders"}`
                : "No one yet"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
