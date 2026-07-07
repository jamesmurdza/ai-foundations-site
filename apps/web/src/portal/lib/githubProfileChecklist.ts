/** Week 1 — trackable checklist for refreshing a GitHub profile + personal README. */
export const GITHUB_PROFILE_CHECKLIST_KEY_PREFIX = "github-profile-";

export type GitHubProfileCheckItem = {
  key: string;
  label: string;
  group: "profile" | "readme";
};

export const GITHUB_PROFILE_CHECKLIST: GitHubProfileCheckItem[] = [
  { key: "picture", label: "Add a profile picture", group: "profile" },
  { key: "bio", label: "Write a short bio line", group: "profile" },
  {
    key: "links",
    label: "Add links to your LinkedIn, portfolio, or personal website",
    group: "profile",
  },
  {
    key: "skills",
    label: "List the skills and technologies you're comfortable with",
    group: "readme",
  },
  {
    key: "projects",
    label: "Highlight projects or accomplishments you're proud of",
    group: "readme",
  },
  {
    key: "pinned",
    label: "Pin repositories that show your best work",
    group: "readme",
  },
  {
    key: "learning",
    label: "Share what you're currently learning or working on",
    group: "readme",
  },
];

export function githubProfileStepKey(itemKey: string): string {
  return `${GITHUB_PROFILE_CHECKLIST_KEY_PREFIX}${itemKey}`;
}

export function isGitHubProfileStepKey(stepKey: string): boolean {
  return stepKey.startsWith(GITHUB_PROFILE_CHECKLIST_KEY_PREFIX);
}

export const GITHUB_PROFILE_ASSIGNMENT_PROMPT = `Polish your GitHub profile and personal README so people can see who you are and what you've built. Submit your profile URL (github.com/yourname). Follow a few peers in the cohort on GitHub.`;

/**
 * Page 1 of the Week 1 flow — brainstorm / priming. No inputs; it gets students
 * thinking about the raw material for a great profile before they touch settings.
 */
export const GITHUB_PROFILE_BRAINSTORM = {
  intro:
    "Your GitHub profile is the first impression you make on other developers, recruiters, and collaborators. Before you touch a single setting, take a few minutes to think about the story you want it to tell.",
  prompts: [
    {
      title: "What are you proud of?",
      body: "Projects you've built, problems you've solved — even small wins.",
    },
    {
      title: "What are you excited about?",
      body: "The languages, tools, and ideas you love, and what you're learning now.",
    },
    {
      title: "Who's it for?",
      body: "A recruiter, a teammate, a fellow contributor — what should they see first?",
    },
    {
      title: "What makes you, you?",
      body: "Your background, interests outside code, the through-line in what you build.",
    },
  ],
  footer:
    "Jot a few notes down — you'll turn them into your profile and README over the next pages.",
};

export const GITHUB_PROFILE_BRIEF = {
  title: "Week 1: Introducing You!",
  intro:
    "Let’s take some time to refresh your GitHub profiles! Your GitHub profile is the first impression you make on other developers, recruiters, and the open-source community. A well-crafted profile helps others understand who you are and what you’re passionate about.",
  sections: [
    {
      heading: "In your profile:",
      items: [
        { key: "picture", label: "A profile picture" },
        { key: "bio", label: "A short bio line" },
        {
          key: "links",
          label: "Links to your LinkedIn, portfolio, or personal website",
        },
      ],
    },
    {
      heading: "In your personal README:",
      items: [
        { key: "skills", label: "Skills and technologies you're comfortable with" },
        { key: "projects", label: "Projects or accomplishments you're proud of" },
        { key: "pinned", label: "Your best work — pinned on your profile, or shown here" },
        { key: "learning", label: "What you're currently learning or working on" },
      ],
    },
  ],
  footer:
    "All of the above are just guidelines. The most important thing is that it feels like you!",
};

/** Done-state for each brief item, keyed by item key, from saved completions. */
export function buildGitHubProfileBriefDone(
  completions: ReadonlyMap<string, boolean>,
): Record<string, boolean> {
  const done: Record<string, boolean> = {};
  for (const section of GITHUB_PROFILE_BRIEF.sections) {
    for (const item of section.items) {
      done[item.key] = completions.get(githubProfileStepKey(item.key)) ?? false;
    }
  }
  return done;
}

export const GITHUB_PROFILE_INTRO = {
  title: "Step 1: Refresh your GitHub profile",
  profileHeading: "Profile basics",
  readmeHeading: "Personal README",
  footer:
    "When this feels ready, paste your GitHub profile URL below.",
};

export type GitHubProfileChecklistItem = {
  key: string;
  label: string;
  done: boolean;
};

export function buildGitHubProfileChecklistItems(
  completions: ReadonlyMap<string, boolean>,
): GitHubProfileChecklistItem[] {
  return GITHUB_PROFILE_CHECKLIST.map((item) => {
    const key = githubProfileStepKey(item.key);
    return { key, label: item.label, done: completions.get(key) ?? false };
  });
}
