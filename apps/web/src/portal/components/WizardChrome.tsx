import { type ReactNode } from "react";

/**
 * Shared chrome for the weekly guided flows so every week looks the same:
 * a lighter-gray "Week N: Theme" eyebrow above a per-page title (with the header
 * actions aligned to the top and dimmed), and a subtle page-dot navigator.
 */
export function WizardHeader({
  weekLabel,
  title,
  actions,
}: {
  weekLabel?: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        {weekLabel && (
          <p className="text-[13px] font-medium text-slate-channel/60 mb-0.5">
            {weekLabel}
          </p>
        )}
        <h2 className="text-heading-lg leading-tight">{title}</h2>
      </div>
      {actions && (
        <div className="flex items-center gap-1 shrink-0 [&_button]:text-slate-channel/60">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * The in-flow page indicator (one dot per page, current one wider). Neutral gray
 * — not the purple accent — and each dot jumps to that page.
 */
export function WizardDots({
  count,
  current,
  onGo,
}: {
  count: number;
  current: number;
  onGo: (page: number) => void;
}) {
  return (
    <div className="mt-8 flex justify-center gap-2" aria-label="Page">
      {Array.from({ length: count }, (_, i) => {
        const n = i + 1;
        const active = n === current;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onGo(n)}
            aria-label={`Go to page ${n}`}
            aria-current={active ? "step" : undefined}
            className={`h-2 cursor-pointer rounded-full transition-all duration-200 ${
              active
                ? "w-5 bg-slate-channel"
                : "w-2 bg-slate-channel/30 hover:bg-slate-channel/55"
            }`}
          />
        );
      })}
    </div>
  );
}
