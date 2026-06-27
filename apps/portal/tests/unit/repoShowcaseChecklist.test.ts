import { describe, it, expect } from "vitest";
import {
  REPO_SHOWCASE_BRIEF,
  repoShowcaseStepKey,
  isRepoShowcaseStepKey,
  buildRepoShowcaseBriefDone,
} from "@/lib/repoShowcaseChecklist";

describe("repoShowcaseChecklist", () => {
  it("briefs two sections — make it great, make it readable", () => {
    expect(REPO_SHOWCASE_BRIEF.sections).toHaveLength(2);
    const [great, readable] = REPO_SHOWCASE_BRIEF.sections;
    expect(great.items.length).toBeGreaterThanOrEqual(3);
    expect(readable.items.length).toBeGreaterThanOrEqual(3);
    // keys are unique across the whole brief (they namespace completion storage)
    const keys = REPO_SHOWCASE_BRIEF.sections.flatMap((s) =>
      s.items.map((i) => i.key),
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("prefixes step keys for week completion storage", () => {
    expect(repoShowcaseStepKey("readme")).toBe("repo-showcase-readme");
    expect(isRepoShowcaseStepKey("repo-showcase-readme")).toBe(true);
    // must not collide with the Week 1 (github-profile-) namespace
    expect(isRepoShowcaseStepKey("github-profile-bio")).toBe(false);
  });

  it("builds done-state from saved completions, keyed by raw item key", () => {
    const done = buildRepoShowcaseBriefDone(
      new Map([["repo-showcase-readme", true]]),
    );
    expect(done.readme).toBe(true);
    // an item with no saved completion defaults to false
    const otherKey = REPO_SHOWCASE_BRIEF.sections[0].items.find(
      (i) => i.key !== "readme",
    )!.key;
    expect(done[otherKey]).toBe(false);
  });
});
