/** Week 2 — trackable checklist for polishing one repo to showcase. */
export const REPO_SHOWCASE_CHECKLIST_KEY_PREFIX = "repo-showcase-";

export function repoShowcaseStepKey(itemKey: string): string {
  return `${REPO_SHOWCASE_CHECKLIST_KEY_PREFIX}${itemKey}`;
}

export function isRepoShowcaseStepKey(stepKey: string): boolean {
  return stepKey.startsWith(REPO_SHOWCASE_CHECKLIST_KEY_PREFIX);
}

export const REPO_SHOWCASE_BRIEF = {
  title: "Week 2: Showcase your work",
  intro:
    "This week, pick one project — something new you want to start, or something you'd like to improve — and get it ready to show off. A great repo tells people what you built, why it matters, and how to try it, all at a glance.",
  sections: [
    {
      heading: "Make it great:",
      items: [
        {
          key: "readme",
          label: "A clear README — what it does, why it exists, and how to run it",
        },
        {
          key: "license",
          label: "A LICENSE so people know how they can use it",
        },
        {
          key: "demo",
          label: "A demo — a screenshot, GIF, or short video in the README",
        },
      ],
    },
    {
      heading: "Make it readable:",
      items: [
        {
          key: "structure",
          label: "Sensible structure and naming so it's easy to navigate",
        },
        {
          key: "clean",
          label: "No dead code, leftover scratch files, or secrets committed",
        },
        {
          key: "comments",
          label: "A short comment wherever the reasoning isn't obvious",
        },
      ],
    },
  ],
  footer:
    "These are guidelines, not a bar to clear — pick the ones that make your project easier to understand.",
};

/** Done-state for each brief item, keyed by item key, from saved completions. */
export function buildRepoShowcaseBriefDone(
  completions: ReadonlyMap<string, boolean>,
): Record<string, boolean> {
  const done: Record<string, boolean> = {};
  for (const section of REPO_SHOWCASE_BRIEF.sections) {
    for (const item of section.items) {
      done[item.key] = completions.get(repoShowcaseStepKey(item.key)) ?? false;
    }
  }
  return done;
}
