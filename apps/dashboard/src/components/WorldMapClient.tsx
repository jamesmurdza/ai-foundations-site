"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export type CountryPath = {
  d: string;
  fill: string;
  name: string;
  count: number;
};

export type Dot = {
  cx: number;
  cy: number;
  n: number;
  name: string;
};

const HOVER_FILL = "#16a34a";

function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

export function WorldMapClient({
  paths,
  dots,
  width,
  height,
  totalApplicants,
  totalCountries,
}: {
  paths: CountryPath[];
  dots: Dot[];
  width: number;
  height: number;
  totalApplicants: number;
  totalCountries: number;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const ringsRef = useRef<SVGGElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const tipNameRef = useRef<HTMLDivElement | null>(null);
  const tipMetaRef = useRef<HTMLDivElement | null>(null);
  const tipVisibleRef = useRef(false);

  useEffect(() => {
    if (!ringsRef.current) return;
    const rings = ringsRef.current.querySelectorAll<SVGCircleElement>(
      "circle.hh-ring",
    );
    if (rings.length === 0) return;

    const mm = gsap.matchMedia();
    mm.add(
      { reduceMotion: "(prefers-reduced-motion: reduce)" },
      (ctx) => {
        const reduceMotion = !!ctx?.conditions?.reduceMotion;
        if (reduceMotion) {
          gsap.set(rings, { scale: 1, opacity: 0.4, transformOrigin: "center" });
          return;
        }
        gsap.set(rings, { transformOrigin: "center" });
        const tween = gsap.fromTo(
          rings,
          { scale: 0.9, opacity: 0.85 },
          {
            scale: 2.4,
            opacity: 0,
            duration: 2.2,
            ease: "power2.out",
            repeat: -1,
            stagger: { each: 0.15, from: "random" },
          },
        );
        return () => {
          tween.kill();
        };
      },
    );

    return () => {
      mm.revert();
    };
  }, [dots]);

  function showTip() {
    const tip = tipRef.current;
    if (!tip || tipVisibleRef.current) return;
    tipVisibleRef.current = true;
    gsap.to(tip, {
      autoAlpha: 1,
      duration: 0.18,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  function hideTip() {
    const tip = tipRef.current;
    if (!tip || !tipVisibleRef.current) return;
    tipVisibleRef.current = false;
    gsap.to(tip, {
      autoAlpha: 0,
      duration: 0.15,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  function moveTipTo(clientX: number, clientY: number) {
    const tip = tipRef.current;
    const svg = svgRef.current;
    if (!tip || !svg) return;
    const rect = svg.getBoundingClientRect();
    const x = clientX - rect.left + 12;
    const y = clientY - rect.top + 12;
    tip.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function setTipText(name: string, count: number) {
    if (tipNameRef.current) tipNameRef.current.textContent = name;
    if (tipMetaRef.current) {
      tipMetaRef.current.textContent =
        count > 0
          ? `${count} ${count === 1 ? "applicant" : "applicants"}`
          : "No applicants yet";
    }
  }

  function onPathEnter(e: React.MouseEvent<SVGPathElement>, p: CountryPath) {
    const target = e.currentTarget;
    const emptyHover = cssVar("--color-map-empty-hover", "#e6e7ea");
    const canvas = cssVar("--color-map-border", "#ffffff");
    gsap.to(target, {
      fill: p.count > 0 ? HOVER_FILL : emptyHover,
      strokeWidth: 1.1,
      stroke: p.count > 0 ? "#0f3d22" : canvas,
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
    setTipText(p.name, p.count);
    moveTipTo(e.clientX, e.clientY);
    showTip();
  }

  function onPathMove(e: React.MouseEvent<SVGPathElement>) {
    moveTipTo(e.clientX, e.clientY);
  }

  function onPathLeave(e: React.MouseEvent<SVGPathElement>, p: CountryPath) {
    // p.fill from the server can be "var(--color-map-empty)" for empty
    // countries — resolve it at runtime so the tween targets a concrete colour.
    const resolvedFill = p.count === 0 ? cssVar("--color-map-empty", "#f1f1f3") : p.fill;
    gsap.to(e.currentTarget, {
      fill: resolvedFill,
      strokeWidth: 0.5,
      stroke: cssVar("--color-map-border", "#ffffff"),
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
    hideTip();
  }

  return (
    <section className="relative rounded-[18px] border border-hairline bg-canvas px-5 py-5 sm:px-6 sm:py-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[12px] uppercase tracking-[0.18em] text-ink-48">
            Where applicants are from
          </p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.01em] text-ink">
            {totalApplicants}{" "}
            {totalApplicants === 1 ? "applicant" : "applicants"} ·{" "}
            {totalCountries}{" "}
            {totalCountries === 1 ? "country" : "countries"}
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-ink-48">
          <span>Fewer</span>
          <span
            className="inline-block h-2 w-24 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, rgb(200,230,211) 0%, rgb(22,101,52) 100%)",
            }}
          />
          <span>More</span>
        </div>
      </div>

      <div className="relative -mx-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="block h-auto w-full"
          role="img"
          aria-label="World map of applicants"
          onMouseLeave={hideTip}
        >
          <g style={{ stroke: "var(--color-map-border)" }}>
            {paths.map((p, i) => (
              <path
                key={i}
                d={p.d}
                fill={p.fill}
                strokeWidth={0.5}
                strokeLinejoin="round"
                style={{
                  cursor: p.count > 0 ? "pointer" : "default",
                  transition: "none",
                }}
                onMouseEnter={(e) => onPathEnter(e, p)}
                onMouseMove={onPathMove}
                onMouseLeave={(e) => onPathLeave(e, p)}
              />
            ))}
          </g>

          <defs>
            <radialGradient id="hh-blip" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#22c55e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g ref={ringsRef} pointerEvents="none">
            {dots.map((d, i) => (
              <g key={`d-${i}`}>
                <circle
                  className="hh-ring"
                  cx={d.cx}
                  cy={d.cy}
                  r={6}
                  fill="url(#hh-blip)"
                  style={{ transformBox: "fill-box" }}
                />
                <circle cx={d.cx} cy={d.cy} r={2.2} fill="#16a34a" />
              </g>
            ))}
          </g>
        </svg>

        <div
          ref={tipRef}
          className="pointer-events-none absolute left-0 top-0 z-10 rounded-[10px] border border-hairline bg-canvas/95 px-3 py-1.5 text-[12px] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.18)] backdrop-blur-sm"
          style={{ visibility: "hidden", opacity: 0, willChange: "transform, opacity" }}
        >
          <div ref={tipNameRef} className="font-medium text-ink" />
          <div ref={tipMetaRef} className="text-ink-48" />
        </div>
      </div>
    </section>
  );
}
