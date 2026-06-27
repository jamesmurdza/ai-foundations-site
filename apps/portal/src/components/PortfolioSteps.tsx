import { type ReactNode } from "react";
import { WeekWizard } from "@/components/WeekWizard";
import {
  PORTFOLIO_BRIEF,
  PORTFOLIO_CHECKLIST_KEY_PREFIX,
} from "@/lib/portfolioChecklist";

// Week 4 — build a portfolio and find your spark. Thin copy wrapper.
export function PortfolioSteps(props: {
  weekId: string;
  done: Record<string, boolean>;
  actions?: ReactNode;
  formFields: ReactNode;
  submitAction: (formData: FormData) => void | Promise<void>;
}) {
  const [portfolio, spark] = PORTFOLIO_BRIEF.sections;
  return (
    <WeekWizard
      {...props}
      keyPrefix={PORTFOLIO_CHECKLIST_KEY_PREFIX}
      title={PORTFOLIO_BRIEF.title}
      section1={portfolio}
      section2={spark}
      page1Before={
        <p className="text-[15px] leading-relaxed">{PORTFOLIO_BRIEF.intro}</p>
      }
      page2Before={
        <p className="text-[15px] leading-relaxed">
          Tools and projects matter, but so does direction. Take a few minutes
          on what&apos;s next for you:
        </p>
      }
      page2After={
        <p className="text-[15px] leading-relaxed mt-4">
          {PORTFOLIO_BRIEF.footer}
        </p>
      }
    />
  );
}
