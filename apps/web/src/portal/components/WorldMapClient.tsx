"use client";

import { useRef, useState } from "react";

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

export function WorldMapClient({
  paths,
  dots,
  personDots = [],
  mode = "aggregate",
  width,
  height,
  total,
  countries,
  withoutLocation = 0,
  legend,
}: {
  paths: CountryPath[];
  dots: Dot[];
  personDots?: PersonDot[];
  mode?: "aggregate" | "people";
  width: number;
  height: number;
  total: number;
  countries: number;
  withoutLocation?: number;
  legend: { country: string; count: number }[];
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
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

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <div className="meta-light text-[12px] uppercase tracking-[0.16em]">
            {peopleMode ? "The cohort on the map" : "Where the cohort builds from"}
          </div>
          <div className="text-[18px] font-bold mt-1">
            {total} {total === 1 ? "builder" : "builders"} · {countries}{" "}
            {countries === 1 ? "country" : "countries"}
            {withoutLocation > 0 && (
              <span className="meta-light text-[14px] font-normal">
                {" "}
                · +{withoutLocation} without location
              </span>
            )}
          </div>
        </div>
        {!peopleMode && (
          <div className="hidden sm:flex items-center gap-2 meta-light text-[11px]">
            <span>Fewer</span>
            <span
              className="inline-block h-2 w-24 rounded-full"
              style={{ background: "linear-gradient(90deg, #efeafe 0%, #4c24c6 100%)" }}
            />
            <span>More</span>
          </div>
        )}
      </div>

      <div ref={wrapRef} className="relative rounded-cards border border-sea-fog bg-canvas-white overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block w-full h-auto"
          role="img"
          aria-label="World map of where the cohort is from"
          onMouseMove={move}
          onMouseLeave={() => setHover(null)}
        >
          <g style={{ stroke: "var(--map-border)", opacity: peopleMode ? 0.55 : 1 }}>
            {paths.map((p, i) => (
              <path
                key={i}
                d={p.d}
                fill={
                  hover?.kind === "country" && hover.name === p.name && p.count > 0
                    ? "#5b2bee"
                    : p.fill
                }
                strokeWidth={0.5}
                strokeLinejoin="round"
                style={{ cursor: p.count > 0 ? "pointer" : "default" }}
                onMouseEnter={(e) => {
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
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) => {
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
        </svg>

        <div
          ref={tipRef}
          className="pointer-events-none absolute left-0 top-0 z-10 rounded-[10px] border border-sea-fog bg-canvas-white px-3 py-1.5 text-[12px] shadow-card-2"
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

      {total === 0 ? (
        <p className="meta text-center mt-4">
          As the cohort grows, the map lights up across the globe.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {legend.map((l) => (
            <span key={l.country} className="pill bg-ice-tint text-slate-channel">
              {l.country} · {l.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
