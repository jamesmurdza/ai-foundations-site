"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { toggleWeekStep } from "@/lib/actions/engagement";
import { SubmitButton } from "@/components/SubmitButton";
import {
  CONTRIBUTION_BRIEF,
  contributionStepKey,
} from "@/lib/contributionChecklist";

type Section = { heading: string; items: { key: string; label: string }[] };

/**
 * Week 3 — make an open-source contribution, as a linear three-page flow:
 * page 1 is the first checklist (find a peer's project, read it), page 2 is the
 * second checklist plus the pull-request form, and page 3 is an optional second
 * pass that shows the same form again for a contribution to a tool you use.
 * There's no early submit button — the form only appears once you reach page 2.
 */
export function ContributionSteps({
  weekId,
  done: initialDone,
  actions,
  formFields,
  submitAction,
}: {
  weekId: string;
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
        await toggleWeekStep(weekId, contributionStepKey(itemKey), next);
      } catch {
        setDone(snapshot);
      }
    });
  }

  const checklist = (section: Section) => (
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

  const [peerProject, goodPr] = CONTRIBUTION_BRIEF.sections;

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-heading-lg leading-tight">
          {CONTRIBUTION_BRIEF.title}
        </h2>
        {actions && (
          <div className="flex items-center gap-1 shrink-0">{actions}</div>
        )}
      </div>

      {step === 1 && (
        <>
          <p className="text-[15px] leading-relaxed">{CONTRIBUTION_BRIEF.intro}</p>
          <p className="text-[15px] leading-relaxed mt-4">
            Your goal this week is one real pull request — start with a peer&apos;s
            project from{" "}
            <Link href="/discover?tab=showcase" className="link">
              the showcase
            </Link>
            .
          </p>
          {checklist(peerProject)}
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
      )}

      {step === 2 && (
        <>
          <p className="text-[15px] leading-relaxed">
            A maintainer should be able to read your pull request and say
            &ldquo;yes&rdquo; in a minute. Here&apos;s how to make that easy:
          </p>
          {checklist(goodPr)}
          <p className="text-[15px] leading-relaxed mt-4">
            {CONTRIBUTION_BRIEF.footer}
          </p>
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
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="link text-[14px]"
            >
              Want to go further? (optional) →
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <p className="text-[15px] leading-relaxed">
            Want to push further? Make a second contribution — this time to an
            open-source tool or product you actually use. It&apos;s optional, but
            it&apos;s where contributing really starts to compound. Paste that pull
            request below.
          </p>
          <form action={submitAction} className="space-y-4 mt-6">
            {formFields}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
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
