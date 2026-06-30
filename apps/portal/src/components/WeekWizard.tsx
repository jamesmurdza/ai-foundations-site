"use client";

import { useState, useTransition, type ReactNode } from "react";
import { toggleWeekStep } from "@/lib/actions/engagement";
import { SubmitButton } from "@/components/SubmitButton";

export type WizardSection = {
  heading: string;
  items: { key: string; label: string }[];
};

/**
 * The shared two-page week wizard: a brief on page 1, a second checklist + the
 * submission form on page 2, with persistent per-item checkboxes and a
 * Back/Submit row. Weeks 2-4 are thin wrappers that pass their own copy and
 * form fields (Week 1's profile flow has its own component for its README step).
 *
 * `page*Before` / `page*After` are the prose around each page's checklist, so
 * each week can keep its own voice and links while sharing all the mechanics.
 */
export function WeekWizard({
  weekId,
  keyPrefix,
  title,
  section1,
  section1Extra,
  section2,
  page1Before,
  page1After,
  page2Before,
  page2After,
  done: initialDone,
  actions,
  formFields,
  submitAction,
}: {
  weekId: string;
  keyPrefix: string;
  title: string;
  section1: WizardSection;
  /** Optional bonus checklist shown below section1 on page 1, set off by a
   *  divider (e.g. Week 3's "extra credit" Level 2). */
  section1Extra?: WizardSection;
  section2: WizardSection;
  page1Before: ReactNode;
  page1After?: ReactNode;
  page2Before?: ReactNode;
  page2After?: ReactNode;
  done: Record<string, boolean>;
  actions?: ReactNode;
  formFields: ReactNode;
  submitAction: (formData: FormData) => void | Promise<void>;
}) {
  const [done, setDone] = useState(initialDone);
  const [, startTransition] = useTransition();
  const [step, setStep] = useState(1);

  function toggle(itemKey: string, next: boolean) {
    const snapshot = done;
    setDone((d) => ({ ...d, [itemKey]: next }));
    startTransition(async () => {
      try {
        await toggleWeekStep(weekId, `${keyPrefix}${itemKey}`, next);
      } catch {
        setDone(snapshot);
      }
    });
  }

  const checklist = (section: WizardSection) => (
    <div className="mt-4">
      <p className="font-semibold text-[15px]">{section.heading}</p>
      <ul className="mt-2 space-y-1.5">
        {section.items.map((item) => {
          const checked = done[item.key] ?? false;
          return (
            <li key={item.key}>
              <label className="flex items-start gap-2.5 cursor-pointer text-[15px]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => toggle(item.key, e.target.checked)}
                  data-testid={`checklist-toggle-${item.key}`}
                  className="mt-1 h-4 w-4 shrink-0 accent-primary cursor-pointer"
                />
                <span
                  className={
                    checked
                      ? "text-slate-channel line-through decoration-slate-channel/40"
                      : ""
                  }
                >
                  {item.label}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-heading-lg leading-tight">{title}</h2>
        {actions && (
          <div className="flex items-center gap-1 shrink-0">{actions}</div>
        )}
      </div>

      {step === 1 ? (
        <>
          {page1Before}
          {checklist(section1)}
          {section1Extra && (
            <div className="mt-6 hairline pt-1">{checklist(section1Extra)}</div>
          )}
          {page1After}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn btn-primary"
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <>
          {page2Before}
          {checklist(section2)}
          {page2After}
          <form action={submitAction} className="space-y-4 mt-6">
            {formFields}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-ghost !px-2"
              >
                ← Back
              </button>
              <SubmitButton className="btn btn-primary">Submit</SubmitButton>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
