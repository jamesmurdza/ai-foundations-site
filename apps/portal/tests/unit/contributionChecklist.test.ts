import { describe, it, expect } from "vitest";
import {
  CONTRIBUTION_BRIEF,
  contributionStepKey,
  isContributionStepKey,
  buildContributionBriefDone,
} from "@/lib/contributionChecklist";

describe("contributionChecklist", () => {
  it("splits Level 1 (main) from Level 2 (extra credit), plus the PR section", () => {
    expect(CONTRIBUTION_BRIEF.sections).toHaveLength(2);
    const [level1, pr] = CONTRIBUTION_BRIEF.sections;
    expect(level1.heading).toMatch(/level 1/i);
    expect(level1.items.length).toBeGreaterThanOrEqual(2);
    expect(pr.items.length).toBeGreaterThanOrEqual(3);
    // Level 2 is a separate, optional step
    expect(CONTRIBUTION_BRIEF.extraCredit.heading).toMatch(/extra credit/i);
    expect(CONTRIBUTION_BRIEF.extraCredit.items.length).toBeGreaterThanOrEqual(1);
    // keys unique across every group (they share the completion namespace)
    const keys = [
      ...CONTRIBUTION_BRIEF.sections,
      CONTRIBUTION_BRIEF.extraCredit,
    ].flatMap((s) => s.items.map((i) => i.key));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("prefixes step keys for week completion storage", () => {
    expect(contributionStepKey("find")).toBe("contribution-find");
    expect(isContributionStepKey("contribution-find")).toBe(true);
    expect(isContributionStepKey("repo-showcase-readme")).toBe(false);
  });

  it("builds done-state across all groups, including the extra-credit step", () => {
    const done = buildContributionBriefDone(
      new Map([
        ["contribution-find", true],
        ["contribution-tool", true],
      ]),
    );
    expect(done.find).toBe(true); // Level 1 item
    expect(done.tool).toBe(true); // Level 2 extra-credit item is included
    const prItemKey = CONTRIBUTION_BRIEF.sections[1].items[0].key;
    expect(done[prItemKey]).toBe(false); // a PR item, not completed
  });
});
