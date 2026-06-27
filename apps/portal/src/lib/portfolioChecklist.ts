/** Week 4 — trackable checklist for a portfolio + finding your spark. */
export const PORTFOLIO_CHECKLIST_KEY_PREFIX = "portfolio-";

export function portfolioStepKey(itemKey: string): string {
  return `${PORTFOLIO_CHECKLIST_KEY_PREFIX}${itemKey}`;
}

export function isPortfolioStepKey(stepKey: string): boolean {
  return stepKey.startsWith(PORTFOLIO_CHECKLIST_KEY_PREFIX);
}

export const PORTFOLIO_BRIEF = {
  title: "Week 4: Your portfolio & spark",
  intro:
    "This is the week it all comes together. A portfolio is where your projects, your story, and your spark live in one place — the thing you send when someone asks “what have you built?” It's also where you work out what you actually want to build next.",
  sections: [
    {
      heading: "Put together a portfolio:",
      items: [
        {
          key: "site",
          label: "A portfolio site (or a polished profile README) people can visit",
        },
        {
          key: "projects",
          label: "Feature 2–3 projects: what they do, your role, and a link",
        },
        {
          key: "about",
          label: "An about section — who you are and what you're into",
        },
        {
          key: "contact",
          label: "A clear way to reach you (email, LinkedIn, socials)",
        },
      ],
    },
    {
      heading: "Find your spark:",
      items: [
        {
          key: "spark",
          label: "Name what genuinely excites you to build — your spark",
        },
        {
          key: "direction",
          label: "Pick a direction to go deeper: a role, a niche, or a project",
        },
        {
          key: "reach",
          label: "Optional — how you'd approach companies, freelance, or pitch yourself",
        },
      ],
    },
  ],
  footer:
    "Your portfolio is never “finished” — ship a version you're proud of today, and keep adding to it.",
};

/** Done-state for each brief item, keyed by item key, from saved completions. */
export function buildPortfolioBriefDone(
  completions: ReadonlyMap<string, boolean>,
): Record<string, boolean> {
  const done: Record<string, boolean> = {};
  for (const section of PORTFOLIO_BRIEF.sections) {
    for (const item of section.items) {
      done[item.key] = completions.get(portfolioStepKey(item.key)) ?? false;
    }
  }
  return done;
}
