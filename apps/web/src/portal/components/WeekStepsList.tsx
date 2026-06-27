"use client";

import Link from "@portal/components/Link";
import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { toggleWeekStep } from "@portal/lib/actions/engagement";
import { weekStepIcon } from "@portal/lib/weekStepIcons";

export type WeekStepItem = {
  key: string;
  title: string;
  blurb: string;
  href: string;
  ctaLabel: string;
  done: boolean;
};

/** Interactive week checklist — participants check/uncheck steps like a todo list. */
export function WeekStepsList({
  weekId,
  weekNumber,
  steps: initialSteps,
}: {
  weekId: string;
  weekNumber: number;
  steps: WeekStepItem[];
}) {
  const [steps, setSteps] = useState(initialSteps);
  const [pending, startTransition] = useTransition();

  function onToggle(stepKey: string) {
    const step = steps.find((s) => s.key === stepKey);
    if (!step || pending) return;

    const next = !step.done;
    const snapshot = steps;

    setSteps((prev) =>
      prev.map((s) => (s.key === stepKey ? { ...s, done: next } : s)),
    );

    startTransition(async () => {
      try {
        await toggleWeekStep(weekId, stepKey, next);
      } catch {
        setSteps(snapshot);
      }
    });
  }

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="text-[22px] font-bold">
          Let&apos;s get started with Week {weekNumber}
        </h3>
        <span className="meta text-[14px]">
          {doneCount} of {steps.length} done
        </span>
      </div>

      <ol className="space-y-3">
        {steps.map((step, i) => {
          const Icon = weekStepIcon(step.key);
          return (
            <li key={step.key}>
              <div className="card card-hover flex items-center gap-4 !py-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggle(step.key);
                  }}
                  disabled={pending}
                  aria-label={
                    step.done
                      ? `Mark "${step.title}" as not done`
                      : `Mark "${step.title}" as done`
                  }
                  aria-pressed={step.done}
                  data-testid={`week-step-toggle-${step.key}`}
                  className={`relative z-10 grid place-items-center w-9 h-9 rounded-full shrink-0 text-[15px] font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 ${
                    step.done
                      ? "bg-primary text-white"
                      : "bg-primary-soft text-primary-strong"
                  }`}
                >
                  {step.done ? <Check size={18} aria-hidden /> : i + 1}
                </button>

                <Link
                  href={step.href}
                  className="flex flex-1 items-center gap-4 min-w-0 no-underline text-inherit"
                >
                  <span className="grid place-items-center w-9 h-9 rounded-[11px] bg-ice-tint text-slate-channel shrink-0">
                    <Icon size={18} aria-hidden />
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-[17px] truncate ${
                          step.done
                            ? "text-slate-channel line-through decoration-slate-channel/40"
                            : ""
                        }`}
                      >
                        {step.title}
                      </span>
                      {step.done && <span className="badge badge-teal">done ✓</span>}
                    </div>
                    <p className="meta text-[14px] line-clamp-2 mt-0.5">{step.blurb}</p>
                  </div>

                  <span className="btn btn-outline btn-sm shrink-0 hidden sm:inline-flex">
                    {step.ctaLabel} →
                  </span>
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
