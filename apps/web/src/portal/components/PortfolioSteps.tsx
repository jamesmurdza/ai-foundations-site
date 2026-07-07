import { type ReactNode } from "react";
import { WeekWizard } from "@portal/components/WeekWizard";
import {
  PORTFOLIO_BRIEF,
  PORTFOLIO_CHECKLIST_KEY_PREFIX,
} from "@portal/lib/portfolioChecklist";

// Week 4 — find your direction, then build a portfolio around it. Direction
// comes first because naming what excites you gives the portfolio something to say.
export function PortfolioSteps(props: {
  weekId: string;
  weekLabel?: string;
  done: Record<string, boolean>;
  actions?: ReactNode;
  formFields: ReactNode;
  submitAction: (formData: FormData) => void | Promise<void>;
}) {
  const [portfolio, direction] = PORTFOLIO_BRIEF.sections;
  return (
    <WeekWizard
      {...props}
      keyPrefix={PORTFOLIO_CHECKLIST_KEY_PREFIX}
      headers={["Start with your direction", "Build your portfolio, then submit"]}
      section1={direction}
      section2={portfolio}
      page1Before={
        <>
          <p className="text-[15px] leading-relaxed">{PORTFOLIO_BRIEF.intro}</p>
          <p className="text-[15px] leading-relaxed mt-4">
            Start with your direction. Tools and projects matter, but so does
            knowing what you want to build next — naming what genuinely excites
            you gives your portfolio something to say.
          </p>
        </>
      }
      page2Before={
        <p className="text-[15px] leading-relaxed">
          Now build the portfolio around it — the place your projects, your
          story, and your direction live together:
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
