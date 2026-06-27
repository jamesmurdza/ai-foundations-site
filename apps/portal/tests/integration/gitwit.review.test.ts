import { describe, it, expect } from "vitest";
import {
  reviewProfile,
  partitionReview,
  type GitWitReview,
  type ProfileSignals,
} from "@/lib/gitwit";

// These hit the real Anthropic API — skip when no key is configured so a plain
// `npm test` stays green without credentials.
const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);

// A real photo avatar (GitHub user #1) so the picture check has a true positive.
const REAL_PHOTO = "https://avatars.githubusercontent.com/u/1?v=4";

const completeProfile: ProfileSignals = {
  login: "jordan-dev",
  name: "Jordan Lee",
  bio: "Full-stack engineer who loves building developer tools.",
  avatarUrl: REAL_PHOTO,
  website: "https://jordan.dev",
  linkedin: "https://linkedin.com/in/jordan-dev",
  twitter: null,
  pinnedRepos: [
    { name: "devflow", description: "A CI/CD dashboard" },
    { name: "querylens", description: "Open-source SQL profiler" },
  ],
  readmeMarkdown: `# Hi, I'm Jordan 👋
Full-stack engineer who loves building developer tools.

## 🛠️ Skills & Technologies
TypeScript, React, Next.js, Node.js, Python, PostgreSQL, Docker, AWS

## 🚀 Projects I'm proud of
- **DevFlow** — a CI/CD dashboard used by 2k+ developers
- **QueryLens** — an open-source SQL profiler (1.3k stars)

## 📌 Featured work
Check out my pinned repos: devflow, querylens, and ts-utils.

## 🌱 Currently learning
Diving into Rust and distributed systems this summer.

## 📫 Reach me
LinkedIn: https://linkedin.com/in/jordan-dev · Website: https://jordan.dev
`,
};

const partialProfile: ProfileSignals = {
  login: "sam",
  name: "Sam",
  bio: "Junior developer.",
  avatarUrl: REAL_PHOTO,
  website: null,
  linkedin: null,
  twitter: null,
  pinnedRepos: [],
  readmeMarkdown: `# Sam

## Skills
JavaScript, HTML, CSS
`,
};

const emptyProfile: ProfileSignals = {
  login: "newcomer",
  name: null,
  bio: null,
  avatarUrl: null,
  website: null,
  linkedin: null,
  twitter: null,
  pinnedRepos: [],
  readmeMarkdown: null,
};

function byId(r: GitWitReview) {
  return Object.fromEntries(r.verdicts.map((v) => [v.id, v]));
}

function dump(label: string, r: GitWitReview) {
  // Visible during `--reporter verbose` so prompt tuning is observable.
  // eslint-disable-next-line no-console
  console.log(
    `\n[${label}]\n` +
      r.verdicts
        .map((v) => `  ${v.met ? "✓" : "✗"} ${v.id}: ${v.note}`)
        .join("\n"),
  );
}

describe.skipIf(!hasKey)("GitWit review — honest, no manufactured todos", () => {
  it("a complete profile returns ALL seven met, with ZERO todos", async () => {
    const review = await reviewProfile(completeProfile);
    dump("complete", review);
    const { good, missing, allGood } = partitionReview(review);

    expect(review.verdicts).toHaveLength(7);
    // The core requirement: a passing profile must NOT produce a fix-list.
    expect(
      missing,
      `Manufactured todos on a complete profile: ${missing
        .map((m) => `${m.id} (${m.note})`)
        .join(" | ")}`,
    ).toHaveLength(0);
    expect(allGood).toBe(true);
    expect(good).toHaveLength(7);
  });

  it("a partial profile acknowledges the good AND flags real gaps", async () => {
    const review = await reviewProfile(partialProfile);
    dump("partial", review);
    const m = byId(review);
    const { good, missing } = partitionReview(review);

    expect(good.length).toBeGreaterThanOrEqual(1); // celebrates what's there
    expect(missing.length).toBeGreaterThanOrEqual(1); // still names gaps
    expect(m.skills.met).toBe(true); // README lists skills
    expect(m.links.met).toBe(false); // no links anywhere
    expect(m.currently_learning.met).toBe(false); // not mentioned
  });

  it("an empty profile is mostly missing — and doesn't rubber-stamp", async () => {
    const review = await reviewProfile(emptyProfile);
    dump("empty", review);
    const m = byId(review);
    const { missing } = partitionReview(review);

    expect(missing.length).toBeGreaterThanOrEqual(5);
    expect(m.profile_picture.met).toBe(false); // no avatar provided
    expect(m.bio.met).toBe(false);
    expect(m.skills.met).toBe(false);
  });

  it("pinned repos count on their own (not in README) and nudge on missing descriptions", async () => {
    const pinnedOnly: ProfileSignals = {
      login: "pinme",
      name: "Pat",
      bio: "Builder of small tools.",
      avatarUrl: REAL_PHOTO,
      website: "https://pat.dev",
      linkedin: "https://linkedin.com/in/pat",
      twitter: null,
      pinnedRepos: [
        { name: "cool-app", description: null },
        { name: "data-tool", description: null },
        { name: "ml-lab", description: "A small ML experiment" },
      ],
      // README intentionally does NOT mention the pinned repos.
      readmeMarkdown:
        "# Pat\nBuilder of small tools.\n\n## Skills\nPython, Go, SQL\n\n## Currently learning\nRust and systems programming.",
    };
    const review = await reviewProfile(pinnedOnly);
    dump("pinned-only", review);
    const m = byId(review);
    expect(m.pinned_repos.met).toBe(true); // pinned alone satisfies it
    expect(m.pinned_repos.note.toLowerCase()).toContain("descript"); // gentle nudge
  });
});
