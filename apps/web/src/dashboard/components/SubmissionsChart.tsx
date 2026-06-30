type Point = { date: string; submitted: number; total: number };

function fmtDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
    ...opts,
  });
}

export function SubmissionsChart({ points }: { points: Point[] }) {
  if (points.length === 0) return null;

  const maxTotal = Math.max(1, ...points.map((p) => p.total));
  const totalSubmitted = points.reduce((acc, p) => acc + p.submitted, 0);
  const totalAll = points.reduce((acc, p) => acc + p.total, 0);

  const W = 1200;
  const H = 220;
  const padX = 12;
  const padTop = 10;
  const padBottom = 28;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;
  const slot = innerW / points.length;
  const barW = Math.max(2, slot - 4);

  // Cumulative submitted line
  const cumulative: number[] = [];
  let acc = 0;
  for (const p of points) {
    acc += p.submitted;
    cumulative.push(acc);
  }
  const maxCumulative = Math.max(1, cumulative[cumulative.length - 1]);
  const linePath = cumulative
    .map((v, i) => {
      const x = padX + slot * i + slot / 2;
      const y = padTop + innerH - (v / maxCumulative) * innerH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];

  return (
    <section className="rounded-[18px] border border-hairline bg-canvas px-4 sm:px-6 py-4 sm:py-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] sm:text-[12px] uppercase tracking-[0.12em] text-ink-48">
            Last 30 days
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-semibold text-[24px] sm:text-[28px] tracking-tight text-ink">
              {totalSubmitted}
            </span>
            <span className="text-[12px] sm:text-[13px] text-ink-48">
              submitted · {totalAll} total opened
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[12px] text-ink-48">
          <Legend color="bg-action" label="Submitted" />
          <Legend color="bg-pearl ring-1 ring-hairline" label="In progress" />
          <Legend color="bg-ink/80" label="Cumulative" thinLine />
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full h-auto"
        role="img"
        aria-label={`Daily applications for the last ${points.length} days`}
      >
        {/* baseline */}
        <line
          x1={padX}
          x2={W - padX}
          y1={padTop + innerH}
          y2={padTop + innerH}
          stroke="#e0e0e0"
          strokeWidth="1"
        />

        {points.map((p, i) => {
          const x = padX + slot * i + (slot - barW) / 2;
          const totalH = (p.total / maxTotal) * innerH;
          const submittedH = (p.submitted / maxTotal) * innerH;
          const yTotal = padTop + innerH - totalH;
          const ySubmitted = padTop + innerH - submittedH;
          return (
            <g key={p.date}>
              <title>
                {fmtDate(p.date)}: {p.submitted} submitted, {p.total - p.submitted} in progress
              </title>
              {/* in-progress portion (light) */}
              {p.total > p.submitted && (
                <rect
                  x={x}
                  y={yTotal}
                  width={barW}
                  height={Math.max(0, totalH - submittedH)}
                  fill="#f0f0f0"
                  rx="2"
                  ry="2"
                />
              )}
              {/* submitted portion */}
              {p.submitted > 0 && (
                <rect
                  x={x}
                  y={ySubmitted}
                  width={barW}
                  height={submittedH}
                  fill="#0066cc"
                  rx="2"
                  ry="2"
                />
              )}
            </g>
          );
        })}

        {/* cumulative line */}
        <path
          d={linePath}
          fill="none"
          stroke="#1d1d1f"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />

        {/* axis labels: first, middle, last */}
        <text
          x={padX}
          y={H - 8}
          fontSize="11"
          fill="#7a7a7a"
          fontFamily="inherit"
        >
          {fmtDate(firstPoint.date)}
        </text>
        <text
          x={W - padX}
          y={H - 8}
          fontSize="11"
          fill="#7a7a7a"
          fontFamily="inherit"
          textAnchor="end"
        >
          {fmtDate(lastPoint.date)}
        </text>
      </svg>
    </section>
  );
}

function Legend({
  color,
  label,
  thinLine,
}: {
  color: string;
  label: string;
  thinLine?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={
          thinLine
            ? `inline-block h-[2px] w-3 rounded ${color}`
            : `inline-block h-2.5 w-2.5 rounded-sm ${color}`
        }
      />
      {label}
    </span>
  );
}
