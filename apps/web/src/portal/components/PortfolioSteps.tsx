import { type ReactNode } from "react";
import { WeekWizard } from "@portal/components/WeekWizard";
import {
  PORTFOLIO_BRIEF,
  PORTFOLIO_CHECKLIST_KEY_PREFIX,
} from "@portal/lib/portfolioChecklist";

// Week 4 — find your spark, then build a portfolio around it. Spark comes first
// because naming what excites you is what gives the portfolio its direction.
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
      section1={spark}
      section2={portfolio}
      page1Before={
        <>
          <p className="text-[15px] leading-relaxed">{PORTFOLIO_BRIEF.intro}</p>
          <p className="text-[15px] leading-relaxed mt-4">
            Start with your spark. Tools and projects matter, but so does
            direction — naming what genuinely excites you is what gives your
            portfolio something to say.
          </p>
        </>
      }
      page2Before={
        <p className="text-[15px] leading-relaxed">
          Now build the portfolio around it — the place your projects, your
          story, and your spark live together:
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
