import { type ReactNode } from "react";
import { WeekWizard } from "@/components/WeekWizard";
import {
  REPO_SHOWCASE_BRIEF,
  REPO_SHOWCASE_CHECKLIST_KEY_PREFIX,
} from "@/lib/repoShowcaseChecklist";

// Week 2 — pick & polish one repo to showcase. Thin copy wrapper over WeekWizard.
export function RepoShowcaseSteps(props: {
  weekId: string;
  done: Record<string, boolean>;
  actions?: ReactNode;
  formFields: ReactNode;
  submitAction: (formData: FormData) => void | Promise<void>;
}) {
  const [great, readable] = REPO_SHOWCASE_BRIEF.sections;
  return (
    <WeekWizard
      {...props}
      keyPrefix={REPO_SHOWCASE_CHECKLIST_KEY_PREFIX}
      title={REPO_SHOWCASE_BRIEF.title}
      section1={great}
      section2={readable}
      page1Before={
        <>
          <p className="text-[15px] leading-relaxed">
            {REPO_SHOWCASE_BRIEF.intro}
          </p>
          <p className="text-[15px] leading-relaxed mt-4">
            Pick one repo and make it easy to fall in love with. Not sure which
            license to use? The{" "}
            <a
              href="https://choosealicense.com"
              target="_blank"
              rel="noreferrer"
              className="link"
            >
              choosealicense.com
            </a>{" "}
            guide takes about a minute.
          </p>
        </>
      }
      page2Before={
        <p className="text-[15px] leading-relaxed">
          A readable repo is a kind repo — the easier it is to follow, the more
          likely a peer leaves a star or opens a PR.
        </p>
      }
      page2After={
        <p className="text-[15px] leading-relaxed mt-4">
          {REPO_SHOWCASE_BRIEF.footer}
        </p>
      }
    />
  );
}
