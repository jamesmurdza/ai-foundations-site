/**
 * The fixed checklist GitWit reviews a participant's GitHub profile against.
 *
 * Two groups: things on their GitHub *profile* (picture, bio, links) and things
 * in their *personal README* (skills, projects, pinned work, what they're
 * learning). Each criterion carries an explicit `met` definition so the model
 * judges against a stated bar instead of a vibe — this is what stops it from
 * silently raising the bar to manufacture a to-do.
 */

export type GitWitGroup = "profile" | "readme";

export type GitWitCriterionId =
  | "profile_picture"
  | "bio"
  | "links"
  | "skills"
  | "projects"
  | "pinned_repos"
  | "currently_learning";

export type GitWitCriterion = {
  id: GitWitCriterionId;
  group: GitWitGroup;
  /** Short label shown in the UI. */
  label: string;
  /** What counts as satisfied — handed to the model verbatim. */
  met: string;
};

export const GITWIT_CRITERIA: GitWitCriterion[] = [
  {
    id: "profile_picture",
    group: "profile",
    label: "A profile picture",
    met: "The avatar is a real photo, a logo, or a deliberate custom image — NOT the default GitHub identicon (the auto-generated abstract geometric pattern). If no avatar image is provided at all, it is not met.",
  },
  {
    id: "bio",
    group: "profile",
    label: "A short bio line",
    met: "A short bio or tagline describes who they are — either in the GitHub profile bio field or clearly at the top of the README. A bare name or username alone does not count.",
  },
  {
    id: "links",
    group: "profile",
    label: "Links to LinkedIn, a portfolio, or a personal website",
    met: "At least one link to LinkedIn, a portfolio, or a personal website is present (in the profile fields or the README).",
  },
  {
    id: "skills",
    group: "readme",
    label: "Skills and technologies you're comfortable with",
    met: "The README names skills, languages, frameworks, or technologies they work with.",
  },
  {
    id: "projects",
    group: "readme",
    label: "Projects or accomplishments you're proud of",
    met: "The README highlights at least one project or accomplishment they're proud of.",
  },
  {
    id: "pinned_repos",
    group: "readme",
    label: "Pinned repositories that showcase your best work",
    met: "They have pinned repositories (ideally each with a short description), OR the README links to / showcases specific repositories of their best work. Pinned repositories satisfy this on their own — they do NOT also need to be mentioned in the README.",
  },
  {
    id: "currently_learning",
    group: "readme",
    label: "What you're currently learning or working on",
    met: "The README mentions what they're currently learning or actively working on.",
  },
];

export const GITWIT_CRITERIA_IDS = GITWIT_CRITERIA.map((c) => c.id);

const BY_ID = new Map(GITWIT_CRITERIA.map((c) => [c.id, c]));

export function gitwitCriterion(id: GitWitCriterionId): GitWitCriterion {
  const c = BY_ID.get(id);
  if (!c) throw new Error(`Unknown GitWit criterion: ${id}`);
  return c;
}
