import { type ReactNode } from "react";
import { WeekWizard } from "@/components/WeekWizard";
import {
  CONTRIBUTION_BRIEF,
  CONTRIBUTION_CHECKLIST_KEY_PREFIX,
} from "@/lib/contributionChecklist";

// Week 3 — make an open-source contribution (a pull request). Thin copy wrapper.
export function ContributionSteps(props: {
  weekId: string;
  done: Record<string, boolean>;
  actions?: ReactNode;
  formFields: ReactNode;
  submitAction: (formData: FormData) => void | Promise<void>;
}) {
  const [level1, pullRequest] = CONTRIBUTION_BRIEF.sections;
  return (
    <WeekWizard
      {...props}
      keyPrefix={CONTRIBUTION_CHECKLIST_KEY_PREFIX}
      title={CONTRIBUTION_BRIEF.title}
      section1={level1}
      section1Extra={CONTRIBUTION_BRIEF.extraCredit}
      section2={pullRequest}
      page1Before={
        <>
          <p className="text-[15px] leading-relaxed">
            {CONTRIBUTION_BRIEF.intro}
          </p>
          <p className="text-[15px] leading-relaxed mt-4">
            Your goal this week is one real pull request.{" "}
            <strong>Level 1</strong> is the assignment — <strong>Level 2</strong>{" "}
            is extra credit if you want to go further.
          </p>
        </>
      }
      page2Before={
        <p className="text-[15px] leading-relaxed">
          A maintainer should be able to read your pull request and say “yes” in
          a minute. Here&apos;s how to make that easy:
        </p>
      }
      page2After={
        <p className="text-[15px] leading-relaxed mt-4">
          {CONTRIBUTION_BRIEF.footer}
        </p>
      }
    />
  );
}
