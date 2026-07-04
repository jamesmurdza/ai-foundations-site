/**
 * The curriculum — hardcoded in code, the single source of truth for the
 * program's weeks and assignments. There is no `ss_weeks` / `ss_assignments`
 * table anymore: to change the program, edit the `SPECS` list below.
 *
 * IDs are stable strings (`week-1`, `week-1-assignment`), NOT random UUIDs, so
 * they can be referenced directly and survive redeploys. Other tables
 * (submissions, checkbox completions, resources, Q&A, …) still store these ids
 * verbatim as plain text — they just point at these constants now.
 */

export type Week = {
  id: string;
  number: number;
  theme: string;
  description: string | null;
  streamUrl: string | null;
  recordingUrl: string | null;
  isLive: boolean;
  isPublished: boolean;
  startsAt: Date | null;
};

export type Assignment = {
  id: string;
  weekId: string;
  title: string;
  prompt: string;
  /** link | repo | file | text | any — drives how the submission form renders. */
  submissionType: "link" | "repo" | "file" | "text" | "any";
  deadline: Date | null;
  recurring: boolean;
  reviewCount: number;
};

/** The editable shape: everything else is derived with sensible defaults. */
type WeekSpec = {
  number: number;
  theme: string;
  description: string;
  /** Weeks with no assignment (e.g. the Week 0 welcome) omit this. */
  assignment?: {
    title: string;
    prompt: string;
    submissionType: Assignment["submissionType"];
    /** Optional overrides. */
    deadline?: Date | null;
    recurring?: boolean;
    reviewCount?: number;
  };
};

// ---------------------------------------------------------------------------
// The program. Edit here — this is the whole curriculum.
// ---------------------------------------------------------------------------
const SPECS: WeekSpec[] = [
  {
    number: 0,
    theme: "Welcome",
    description:
      "An intro to AI Summer School — what it is, how the weeks work, and what to expect.",
  },
  {
    number: 1,
    theme: "GitHub Profile",
    description:
      "Polish your GitHub profile and personal README so people can see who you are and what you've built.",
    assignment: {
      title: "Refresh your GitHub profile",
      submissionType: "link",
      prompt:
        "Polish your GitHub profile and personal README so people can see who you are and what you've built. Submit your profile URL (github.com/yourname). Follow a few peers in the cohort on GitHub.",
    },
  },
  {
    number: 2,
    theme: "Showcase your work",
    description:
      "Pick one project to start or improve — make it shine with a great README, a license, and a demo — then showcase it for the cohort to star.",
    assignment: {
      title: "Showcase one repo",
      submissionType: "repo",
      prompt:
        "Pick one project — something new to start, or something you'd like to improve — and get it ready to show off. Give it a clear README, a license, and a demo (a screenshot or short video), and tidy the codebase so it reads well. Then submit the repo URL (github.com/you/project) to showcase it. Turn on Trade Stars to trade stars with the cohort.",
    },
  },
  {
    number: 3,
    theme: "Contribute to open source",
    description:
      "Make your first (or next) open-source contribution — a pull request to a peer's project or to a tool you use — and learn to write and review great PRs.",
    assignment: {
      title: "Make an open-source contribution",
      submissionType: "link",
      prompt:
        "Make a real open-source contribution. Level 1 (the assignment) — open a pull request on a peer's project from the showcase. Level 2 (extra credit) — go further and contribute to an open-source tool or product you actually use. Keep it small and focused, write a clear PR, and review a peer's PR too. Submit the link to your pull request (github.com/owner/repo/pull/123).",
    },
  },
  {
    number: 4,
    theme: "Your portfolio & spark",
    description:
      "Bring it together: a portfolio that shows your best work, and a clear sense of the spark you want to build on next.",
    assignment: {
      title: "Build your portfolio",
      submissionType: "link",
      prompt:
        "Bring it all together. Build a portfolio that shows your best work — projects, an about section, and a way to reach you — and get clear on your spark: what you actually want to build next. Submit your portfolio link, then give feedback on a few peers' profiles to close out the program.",
    },
  },
];

// ---------------------------------------------------------------------------
// Derivation — stable ids + defaults. Nothing below usually needs editing.
// ---------------------------------------------------------------------------
export const weekId = (number: number): string => `week-${number}`;
export const assignmentId = (weekNumber: number): string =>
  `week-${weekNumber}-assignment`;

type FullWeek = Week & { assignments: Assignment[] };

function build(spec: WeekSpec): FullWeek {
  const id = weekId(spec.number);
  const assignments: Assignment[] = spec.assignment
    ? [
        {
          id: assignmentId(spec.number),
          weekId: id,
          title: spec.assignment.title,
          prompt: spec.assignment.prompt,
          submissionType: spec.assignment.submissionType,
          deadline: spec.assignment.deadline ?? null,
          recurring: spec.assignment.recurring ?? false,
          reviewCount: spec.assignment.reviewCount ?? 3,
        },
      ]
    : [];
  return {
    id,
    number: spec.number,
    theme: spec.theme,
    description: spec.description,
    streamUrl: null,
    recordingUrl: null,
    isLive: false,
    isPublished: true,
    startsAt: null,
    assignments,
  };
}

const FULL: FullWeek[] = SPECS.map(build).sort((a, b) => a.number - b.number);

/** All weeks, ordered by number (without their nested assignments). */
export const WEEKS: Week[] = FULL.map(({ assignments: _drop, ...week }) => week);

const ASSIGNMENTS: Assignment[] = FULL.flatMap((w) => w.assignments);

export function findWeek(id: string): Week | null {
  return WEEKS.find((w) => w.id === id) ?? null;
}

export function findWeekByNumber(number: number): Week | null {
  return WEEKS.find((w) => w.number === number) ?? null;
}

export function findAssignment(id: string): Assignment | null {
  return ASSIGNMENTS.find((a) => a.id === id) ?? null;
}

export function assignmentsForWeek(wid: string): Assignment[] {
  return ASSIGNMENTS.filter((a) => a.weekId === wid);
}

/** Every assignment, decorated with its week's number + theme (for lists). */
export function allAssignmentsWithWeek(): (Assignment & {
  weekNumber: number;
  weekTheme: string;
})[] {
  return ASSIGNMENTS.map((a) => {
    const w = findWeek(a.weekId);
    return { ...a, weekNumber: w?.number ?? 0, weekTheme: w?.theme ?? "" };
  });
}

/**
 * The "current" week: a live week wins, then the most-recently-started published
 * week, else the first published week (program start). Mirrors the old
 * getCurrentWeek DB logic — with everything hardcoded, this is just the first
 * published week until a `startsAt`/`isLive` is set in code.
 */
export function currentWeek(): Week | null {
  const live = WEEKS.find((w) => w.isLive);
  if (live) return live;
  const now = Date.now();
  const started = WEEKS.filter(
    (w) => w.isPublished && w.startsAt && w.startsAt.getTime() <= now,
  ).sort((a, b) => b.number - a.number)[0];
  if (started) return started;
  return WEEKS.filter((w) => w.isPublished).sort((a, b) => a.number - b.number)[0] ?? null;
}
