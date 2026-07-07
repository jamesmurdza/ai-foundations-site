"use client";

import { useState, useTransition, type ReactNode } from "react";
import { toggleWeekStep } from "@portal/lib/actions/engagement";
import { SubmitButton } from "@portal/components/SubmitButton";
import { WizardHeader, WizardDots } from "@portal/components/WizardChrome";
import { ReadmeEditor } from "@portal/components/ReadmeEditor";
import {
  GITHUB_PROFILE_BRIEF,
  GITHUB_PROFILE_BRAINSTORM,
  githubProfileStepKey,
} from "@portal/lib/githubProfileChecklist";

/** Props for the embedded README editor on page 3 (when GitHub is connected). */
export type ReadmeEditorProps = {
  login: string;
  initialMarkdown: string;
  hasExisting: boolean;
  /** Where saving redirects — the flow points it at page 4 to double as "continue". */
  returnTo: string;
};

type Section = (typeof GITHUB_PROFILE_BRIEF.sections)[number];

// Week 1 as a linear four-page flow, each page with its own header:
//   1. Brainstorm  — prime what makes a great profile (no inputs)
//   2. Profile     — set up the GitHub profile basics + checklist
//   3. README      — write an awesome README in the embedded editor
//   4. Feedback    — automatic GitWit review, then submit
// Checkbox state persists per item; a subtle page-dot row sits below the flow.
const STEPS = [
  { header: "Before you build your profile" },
  { header: "Set up your GitHub profile" },
  { header: "Write an awesome README" },
  { header: "Get feedback, then submit" },
];

export function GitHubProfileSteps({
  weekId,
  weekLabel,
  done: initialDone,
  actions,
  formFields,
  review,
  readmeEditorProps,
  readmeFallback,
  submitAction,
  initialStep = 1,
}: {
  weekId: string;
  /** Small eyebrow above the page title, e.g. "Week 1: GitHub Profile". */
  weekLabel?: string;
  done: Record<string, boolean>;
  actions?: ReactNode;
  formFields: ReactNode;
  /** The automatic "GitWit review" panel, shown on the final page before submit. */
  review?: ReactNode;
  /** README editor data (page 3). Null when GitHub isn't connected — then
   *  `readmeFallback` renders and page 3 shows an explicit Next instead. */
  readmeEditorProps?: ReadmeEditorProps | null;
  /** Shown on page 3 when there's no editor (e.g. a connect-GitHub prompt). */
  readmeFallback?: ReactNode;
  submitAction: (formData: FormData) => void | Promise<void>;
  /** Which page to open on (server can restore it after the save navigation). */
  initialStep?: number;
}) {
  const [done, setDone] = useState(initialDone);
  const [, startTransition] = useTransition();
  const [step, setStep] = useState(() =>
    Math.min(Math.max(initialStep, 1), STEPS.length),
  );

  function toggle(itemKey: string, next: boolean) {
    const snapshot = done;
    setDone((d) => ({ ...d, [itemKey]: next }));
    startTransition(async () => {
      try {
        await toggleWeekStep(weekId, githubProfileStepKey(itemKey), next);
      } catch {
        setDone(snapshot);
      }
    });
  }

  const [profileSection, readmeSection] = GITHUB_PROFILE_BRIEF.sections;

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

  return (
    <div>
      <WizardHeader
        weekLabel={weekLabel}
        title={STEPS[step - 1].header}
        actions={actions}
      />

      {step === 1 && (
        <>
          <p className="text-[15px] leading-relaxed">
            {GITHUB_PROFILE_BRAINSTORM.intro}
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
            {GITHUB_PROFILE_BRAINSTORM.prompts.map((p) => (
              <li key={p.title}>
                {p.title} {p.body}
              </li>
            ))}
          </ul>
          <p className="text-[15px] leading-relaxed mt-4">
            {GITHUB_PROFILE_BRAINSTORM.footer}
          </p>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn btn-primary"
            >
              Start building →
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <p className="text-[15px] leading-relaxed">
            {GITHUB_PROFILE_BRIEF.intro}
          </p>
          <p className="text-[15px] leading-relaxed mt-4">
            Head over to your{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="link"
            >
              GitHub profile
            </a>{" "}
            and click <strong>Edit profile</strong> to fill in the basics:
          </p>
          {checklist(profileSection)}
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-gray"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="btn btn-primary"
            >
              Next →
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <p className="text-[15px] leading-relaxed">
            Your profile README lives in a special public repository named exactly
            your username — for example, <strong>yourname/yourname</strong>. A great
            README is scannable and personal: a one-line intro, the skills and
            tools you work with, a couple of projects you&apos;re proud of, and what
            you&apos;re learning now. Write and save it right here — it syncs to
            GitHub and shows on your profile.
          </p>
          {checklist(readmeSection)}
          <div className="mt-5">
            {readmeEditorProps ? (
              // The editor's footer carries Back + "Save & continue →" on one line;
              // Back is instant client nav, and saving advances to page 4.
              <ReadmeEditor
                {...readmeEditorProps}
                saveLabel="Save & continue →"
                secondaryAction={
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn btn-gray"
                  >
                    ← Back
                  </button>
                }
              />
            ) : (
              readmeFallback
            )}
          </div>
          {/* No editor to save (GitHub not connected) → own Back + Next row. */}
          {!readmeEditorProps && (
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-gray"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="btn btn-primary"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {step === 4 && (
        <>
          <p className="text-[15px] leading-relaxed">
            Here&apos;s GitWit&apos;s take on your profile — an AI read of the seven
            essentials. Round out anything it flags, hit <strong>Refresh</strong> to
            re-check, then submit when you&apos;re happy.
          </p>
          {review}
          <form action={submitAction} className="space-y-4 mt-6">
            {formFields}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn btn-gray"
              >
                ← Back
              </button>
              <SubmitButton className="btn btn-primary">Submit</SubmitButton>
            </div>
          </form>
        </>
      )}

      <WizardDots count={STEPS.length} current={step} onGo={setStep} />
    </div>
  );
}
