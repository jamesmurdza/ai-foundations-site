import { describe, it, expect } from "vitest";
import {
  CONTRIBUTION_BRIEF,
  contributionStepKey,
  isContributionStepKey,
  buildContributionBriefDone,
} from "@portal/lib/contributionChecklist";

describe("contributionChecklist", () => {
  it("pairs the peer-project + PR sections with an optional go-further step", () => {
    expect(CONTRIBUTION_BRIEF.sections).toHaveLength(2);
    const [peerProject, pr] = CONTRIBUTION_BRIEF.sections;
    expect(peerProject.items.length).toBeGreaterThanOrEqual(2);
    expect(pr.items.length).toBeGreaterThanOrEqual(3);
    // The second contribution is a separate, optional step — no "Level" phrasing.
    expect(CONTRIBUTION_BRIEF.goFurther.heading).toMatch(/optional/i);
    expect(CONTRIBUTION_BRIEF.goFurther.items.length).toBeGreaterThanOrEqual(1);
    const headings = [
      ...CONTRIBUTION_BRIEF.sections.map((s) => s.heading),
      CONTRIBUTION_BRIEF.goFurther.heading,
    ];
    expect(headings.join(" ")).not.toMatch(/level/i);
    // keys unique across every group (they share the completion namespace)
    const keys = [
      ...CONTRIBUTION_BRIEF.sections,
      CONTRIBUTION_BRIEF.goFurther,
    ].flatMap((s) => s.items.map((i) => i.key));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("prefixes step keys for week completion storage", () => {
    expect(contributionStepKey("find")).toBe("contribution-find");
    expect(isContributionStepKey("contribution-find")).toBe(true);
    expect(isContributionStepKey("repo-showcase-readme")).toBe(false);
  });

  it("builds done-state across all groups, including the go-further step", () => {
    const done = buildContributionBriefDone(
      new Map([
        ["contribution-find", true],
        ["contribution-tool", true],
      ]),
    );
    expect(done.find).toBe(true); // peer-project item
    expect(done.tool).toBe(true); // optional go-further item is included
    const prItemKey = CONTRIBUTION_BRIEF.sections[1].items[0].key;
    expect(done[prItemKey]).toBe(false); // a PR item, not completed
  });
});
