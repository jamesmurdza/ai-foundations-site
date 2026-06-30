"use client";

import { useEffect, useRef } from "react";

/**
 * Perspective dot-network banner. Ported from a standalone SVG sketch: builds an
 * addressable grid of perspective "walls" of dots, threads connector lines
 * through them, and applies a subtle mouse-parallax tilt each frame.
 */
export function BannerAnimation() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const SVGNS = "http://www.w3.org/2000/svg";
    const W = 1800;
    const H = 860;
    const YMID = H / 2;

    // Clear any prior render (e.g. React strict-mode double effect).
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    type Node = {
      x: number; y: number; bx: number; depth: number;
      rx: number; ry: number; c: number; r: number;
      el: SVGEllipseElement | null;
    };
    type Wall = { grid: Node[][]; cols: number; rows: number; side: number };

    function el<K extends keyof SVGElementTagNameMap>(
      name: K,
      attrs: Record<string, string | number>,
    ) {
      const n = document.createElementNS(SVGNS, name);
      for (const k in attrs) n.setAttribute(k, String(attrs[k]));
      return n;
    }

    // true 1/z perspective: columns compress toward the back but keep finite spacing
    const DEPTH = 2.0;
    const bunch = (t: number) => {
      const z = 1 + t * (DEPTH - 1);
      return (1 - 1 / z) / (1 - 1 / DEPTH);
    };

    type Panel = {
      xNear: number; xFar: number; hNear: number; hFar: number;
      rNear: number; rFar: number; cols: number; rows: number;
    };

    function makeWall(p: Panel, side: number): Wall {
      const cols = p.cols, rows = p.rows, halfRow = (rows - 1) / 2;
      const grid: Node[][] = [];
      for (let c = 0; c < cols; c++) {
        const t = cols === 1 ? 0 : c / (cols - 1);
        const f = bunch(t);
        let x = p.xNear + (p.xFar - p.xNear) * f;
        const half = p.hNear + (p.hFar - p.hNear) * f;
        const rad = p.rNear + (p.rFar - p.rNear) * f;
        if (side === -1) x = W - x;
        const col: Node[] = [];
        for (let r = 0; r < rows; r++) {
          const off = (r - halfRow) / halfRow;
          const y = YMID + off * half;
          col.push({ x, y, bx: x, depth: f, rx: rad * 0.72, ry: rad * 1.18, c, r, el: null });
        }
        grid.push(col);
      }
      return { grid, cols, rows, side };
    }

    const PANELS: Panel[] = [
      { xNear: 50, xFar: 280, hNear: 386, hFar: 272, rNear: 7.2, rFar: 3.6, cols: 13, rows: 19 },
      { xNear: 372, xFar: 544, hNear: 372, hFar: 206, rNear: 6.0, rFar: 3.0, cols: 12, rows: 19 },
      { xNear: 694, xFar: 814, hNear: 360, hFar: 152, rNear: 5.2, rFar: 2.5, cols: 12, rows: 19 },
    ];

    const walls: Wall[] = [];
    PANELS.forEach((p) => walls.push(makeWall(p, +1)));
    PANELS.forEach((p) => walls.push(makeWall(p, -1)));

    const node = (panel: number, col: number, row: number) => walls[panel].grid[col][row];

    const linkLayer = el("g", {});
    svg.appendChild(linkLayer);

    const HUB_COL = 2;
    const SEQ = [0, 1, 2, 5, 4, 3];
    const upperThreads = [
      [5, 3, 2, 2, 3, 5],
      [5, 4, 2, 5, 5, 7],
      [7, 5, 5, 2, 4, 5],
      [7, 6, 5, 5, 6, 7],
    ];
    const lowerThreads = upperThreads.map((t) => t.map((r) => 18 - r));
    const THREADS = [...upperThreads, ...lowerThreads];

    const overlapMap: Record<number, number> = { 1: 2, 6: 5, 17: 16, 12: 13 };
    for (const w of [2, 5]) for (const src in overlapMap) {
      node(w, HUB_COL, +src).y = node(w, HUB_COL, overlapMap[+src]).y;
    }

    const links: { el: SVGLineElement; a: Node; b: Node }[] = [];
    function link(a: Node, q: Node) {
      const ln = el("line", {
        x1: a.x.toFixed(2), y1: a.y.toFixed(2),
        x2: q.x.toFixed(2), y2: q.y.toFixed(2),
        stroke: "#2626d6", "stroke-width": 2.2, fill: "none", opacity: 0.92,
      }) as SVGLineElement;
      linkLayer.appendChild(ln);
      links.push({ el: ln, a, b: q });
    }
    function thread(rows: number[]) {
      for (let i = 0; i < SEQ.length - 1; i++)
        link(node(SEQ[i], HUB_COL, rows[i]), node(SEQ[i + 1], HUB_COL, rows[i + 1]));
    }
    THREADS.forEach(thread);

    const stubsUpperLeft = [
      [5, 2, 1],
      [7, 7, 6],
    ];
    function stub(layers: number[], rows: number[]) {
      for (let i = 0; i < layers.length - 1; i++)
        link(node(SEQ[layers[i]], HUB_COL, rows[i]), node(SEQ[layers[i + 1]], HUB_COL, rows[i + 1]));
    }
    for (const r of stubsUpperLeft) {
      const lo = r.map((v) => 18 - v), e = r[2], le = lo[2];
      stub([0, 1, 2], r);
      stub([2, 3], [e, e]);
      stub([5, 4, 3], r);
      stub([0, 1, 2], lo);
      stub([2, 3], [le, le]);
      stub([5, 4, 3], lo);
    }

    const dotLayer = el("g", {});
    for (const w of walls) for (const col of w.grid) for (const n of col) {
      n.el = el("ellipse", {
        cx: n.x.toFixed(2), cy: n.y.toFixed(2), rx: n.rx.toFixed(2), ry: n.ry.toFixed(2),
        fill: "#1f1fc4",
      }) as SVGEllipseElement;
      dotLayer.appendChild(n.el);
    }
    svg.appendChild(dotLayer);

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // render static, no parallax loop

    const SHIFT = 70;
    let tilt = 0, tiltTarget = 0;
    const onMove = (e: MouseEvent) => {
      tiltTarget = -(e.clientX / window.innerWidth - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const frame = () => {
      tilt += (tiltTarget - tilt) * 0.08;
      for (const w of walls) for (const col of w.grid) for (const n of col) {
        n.x = n.bx + tilt * SHIFT * n.depth;
        n.el?.setAttribute("cx", n.x.toFixed(2));
      }
      for (const L of links) {
        L.el.setAttribute("x1", L.a.x.toFixed(2));
        L.el.setAttribute("x2", L.b.x.toFixed(2));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div className="w-full aspect-[1800/860] rounded-lg border border-border overflow-hidden bg-white">
      <svg
        ref={svgRef}
        viewBox="0 0 1800 860"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block"
        role="img"
        aria-label="Animated perspective dot-network illustration"
      />
    </div>
  );
}
