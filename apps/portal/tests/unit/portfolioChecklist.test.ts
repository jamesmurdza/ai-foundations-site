import { describe, it, expect } from "vitest";
import {
  PORTFOLIO_BRIEF,
  portfolioStepKey,
  isPortfolioStepKey,
  buildPortfolioBriefDone,
} from "@/lib/portfolioChecklist";

describe("portfolioChecklist", () => {
  it("briefs two sections — build a portfolio, find your spark", () => {
    expect(PORTFOLIO_BRIEF.sections).toHaveLength(2);
    const [portfolio, spark] = PORTFOLIO_BRIEF.sections;
    expect(portfolio.items.length).toBeGreaterThanOrEqual(3);
    expect(spark.items.length).toBeGreaterThanOrEqual(2);
    const keys = PORTFOLIO_BRIEF.sections.flatMap((s) =>
      s.items.map((i) => i.key),
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("prefixes step keys for week completion storage", () => {
    expect(portfolioStepKey("site")).toBe("portfolio-site");
    expect(isPortfolioStepKey("portfolio-site")).toBe(true);
    expect(isPortfolioStepKey("contribution-level1")).toBe(false);
  });

  it("builds done-state from saved completions, keyed by raw item key", () => {
    const done = buildPortfolioBriefDone(new Map([["portfolio-site", true]]));
    expect(done.site).toBe(true);
    const otherKey = PORTFOLIO_BRIEF.sections[0].items.find(
      (i) => i.key !== "site",
    )!.key;
    expect(done[otherKey]).toBe(false);
  });
});
