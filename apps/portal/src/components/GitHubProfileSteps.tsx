"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { toggleWeekStep } from "@/lib/actions/engagement";
import { SubmitButton } from "@/components/SubmitButton";
import {
  GITHUB_PROFILE_BRIEF,
  githubProfileStepKey,
} from "@/lib/githubProfileChecklist";

type Section = (typeof GITHUB_PROFILE_BRIEF.sections)[number];

// Week 1 as a two-step flow: profile basics (page 1), then the personal
// README + submission (page 2). Checkbox state persists per item.
export function GitHubProfileSteps({
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
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-heading-lg leading-tight">
          {GITHUB_PROFILE_BRIEF.title}
        </h2>
        {actions && (
          <div className="flex items-center gap-1 shrink-0">{actions}</div>
        )}
      </div>

      {step === 1 ? (
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
            to get started. Click <strong>Edit profile</strong> to fill in the
            basics:
          </p>
          {checklist(profileSection)}
          <p className="text-[15px] leading-relaxed mt-4">
            We will be adding more content here as we develop the curriculum.
            We could probably get away with one page for this form, but two
            pages gives us more space to add content.
          </p>
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
          <p className="text-[15px] leading-relaxed">
            Your profile README lives in a special public repository named
            exactly your username — for example,{" "}
            <strong>yourname/yourname</strong>. You can write and save it right
            here in the portal — it syncs to GitHub and shows on your profile
            page.
          </p>
          <div className="mt-4">
            <Link href="/profile/edit#readme" className="btn btn-primary">
              Edit your README in the portal →
            </Link>
          </div>
          {checklist(readmeSection)}
          <p className="text-[15px] leading-relaxed mt-4">
            {GITHUB_PROFILE_BRIEF.footer}{" "}
            After saving, you can also{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="link"
            >
              view it on GitHub
            </a>
            .
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
        </>
      )}
    </div>
  );
}
