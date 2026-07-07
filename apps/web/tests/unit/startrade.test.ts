import { describe, it, expect } from "vitest";
import { needsStar, weekAllowsAutoStar } from "@portal/lib/startrade";

const target = { repoOwner: "burhankhatri", repoName: "FlightScrape" };

describe("needsStar", () => {
  it("stars when there is no prior grant", () => {
    expect(needsStar(undefined, target)).toBe(true);
  });

  it("retries when the last attempt failed", () => {
    expect(
      needsStar({ ok: false, repoOwner: "burhankhatri", repoName: "FlightScrape" }, target),
    ).toBe(true);
  });

  it("re-stars when the submitted repo changed (the reported bug)", () => {
    expect(
      needsStar({ ok: true, repoOwner: "burhankhatri", repoName: "PathReport" }, target),
    ).toBe(true);
  });

  it("skips when the same repo was already starred successfully", () => {
    expect(
      needsStar({ ok: true, repoOwner: "burhankhatri", repoName: "FlightScrape" }, target),
    ).toBe(false);
  });

  it("skips when the viewer manually unstarred the repo", () => {
    expect(
      needsStar(
        {
          ok: false,
          repoOwner: "burhankhatri",
          repoName: "FlightScrape",
          error: "manual_unstar",
        },
        target,
      ),
    ).toBe(false);
  });
});

describe("weekAllowsAutoStar", () => {
  it("allows starring as soon as a user opts in", () => {
    expect(weekAllowsAutoStar(1)).toBe(true);
    expect(weekAllowsAutoStar(2)).toBe(true);
    expect(weekAllowsAutoStar(4)).toBe(true);
  });
  it("does not require a current week", () => {
    expect(weekAllowsAutoStar(null)).toBe(true);
  });
});
