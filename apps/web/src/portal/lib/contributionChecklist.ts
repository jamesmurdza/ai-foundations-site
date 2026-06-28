/** Week 3 — trackable checklist for making an open-source contribution. */
export const CONTRIBUTION_CHECKLIST_KEY_PREFIX = "contribution-";

export function contributionStepKey(itemKey: string): string {
  return `${CONTRIBUTION_CHECKLIST_KEY_PREFIX}${itemKey}`;
}

export function isContributionStepKey(stepKey: string): boolean {
  return stepKey.startsWith(CONTRIBUTION_CHECKLIST_KEY_PREFIX);
}

export const CONTRIBUTION_BRIEF = {
  title: "Week 3: Contribute to open source",
  intro:
    "Open source runs the modern world — and it has changed a lot. Today a single good pull request can put your name on a project thousands of people use. Contributing is one of the fastest ways to learn from real codebases, get noticed, and build a portfolio that isn't only your own repos.",
  sections: [
    {
      heading: "Level 1 — contribute to a peer's project",
      items: [
        {
          key: "find",
          label: "Find a peer's project in the showcase to contribute to",
        },
        {
          key: "small",
          label: "Start small: a good first issue, a docs fix, a bug, or a tiny feature",
        },
        {
          key: "read",
          label: "Read the project's README and CONTRIBUTING guide before you start",
        },
      ],
    },
    {
      heading: "Make a pull request people say yes to:",
      items: [
        {
          key: "scope",
          label: "Keep it small and focused — one clear change per PR",
        },
        {
          key: "describe",
          label: "Write a clear title and description: what changed, and why",
        },
        {
          key: "context",
          label: "Link the issue, and add a screenshot or test where it helps",
        },
        {
          key: "review",
          label: "Give feedback on a peer's PR too — kind, specific, and actionable",
        },
      ],
    },
  ],
  // A separate, optional step shown below Level 1 — Level 2 is extra credit.
  extraCredit: {
    heading: "Extra credit · Level 2",
    items: [
      {
        key: "tool",
        label:
          "Go further — open a pull request on an open-source tool or product you actually use",
      },
    ],
  },
  footer:
    "A contribution doesn't have to be big to matter — the best first PRs are small, clear, and finished.",
};

/** Done-state for each brief item (incl. the extra-credit step), from saved completions. */
export function buildContributionBriefDone(
  completions: ReadonlyMap<string, boolean>,
): Record<string, boolean> {
  const done: Record<string, boolean> = {};
  const groups = [...CONTRIBUTION_BRIEF.sections, CONTRIBUTION_BRIEF.extraCredit];
  for (const section of groups) {
    for (const item of section.items) {
      done[item.key] = completions.get(contributionStepKey(item.key)) ?? false;
    }
  }
  return done;
}
