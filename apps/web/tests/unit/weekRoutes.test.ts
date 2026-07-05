import { describe, it, expect } from "vitest";
import {
  weekSubmissionPath,
  weekAssignmentHomePath,
  parseWeekRouteParam,
  isSubmissionUuid,
  maxUnlockedWeekNumber,
  isWeekUnlocked,
} from "@portal/lib/weekRoutes";

describe("weekRoutes", () => {
  it("builds canonical week submission paths (legacy redirect slugs)", () => {
    expect(weekSubmissionPath(1)).toBe("/submissions/week-1");
    expect(weekSubmissionPath(4)).toBe("/submissions/week-4");
  });

  it("builds lesson paths", () => {
    expect(weekAssignmentHomePath("week-1")).toBe("/lessons/week-1");
    expect(weekAssignmentHomePath("week-1", { error: "empty" })).toBe(
      "/lessons/week-1?error=empty",
    );
    expect(weekAssignmentHomePath("week-1", { submitted: true })).toBe(
      "/lessons/week-1?submitted=1",
    );
    expect(weekAssignmentHomePath("week-1", { edit: true })).toBe(
      "/lessons/week-1?edit=1",
    );
  });

  it("parses week-1 and week1 slugs", () => {
    expect(parseWeekRouteParam("week-1")).toBe(1);
    expect(parseWeekRouteParam("week1")).toBe(1);
    expect(parseWeekRouteParam("WEEK-2")).toBe(2);
  });

  it("does not treat UUIDs as week slugs", () => {
    const uuid = "6ca35708-b0ff-41c9-9406-c79f1728b2b4";
    expect(isSubmissionUuid(uuid)).toBe(true);
    expect(parseWeekRouteParam(uuid)).toBeNull();
  });
});

describe("maxUnlockedWeekNumber (sequential lesson gating)", () => {
  it("unlocks only the first program week when nothing is submitted", () => {
    const max = maxUnlockedWeekNumber([
      { number: 1, submitted: false },
      { number: 2, submitted: false },
    ]);
    expect(max).toBe(1);
    expect(isWeekUnlocked(1, max)).toBe(true);
    expect(isWeekUnlocked(2, max)).toBe(false);
  });

  it("unlocks the next week once the previous is submitted", () => {
    const max = maxUnlockedWeekNumber([
      { number: 1, submitted: true },
      { number: 2, submitted: false },
      { number: 3, submitted: false },
    ]);
    expect(max).toBe(2);
    expect(isWeekUnlocked(2, max)).toBe(true); // now open — previous is in
    expect(isWeekUnlocked(3, max)).toBe(false); // still locked
  });

  it("locks everything after the first gap", () => {
    const max = maxUnlockedWeekNumber([
      { number: 1, submitted: true },
      { number: 2, submitted: true },
      { number: 3, submitted: false },
      { number: 4, submitted: false },
    ]);
    expect(max).toBe(3);
    expect(isWeekUnlocked(4, max)).toBe(false);
  });

  it("opens all weeks once every program week is submitted", () => {
    const max = maxUnlockedWeekNumber([
      { number: 1, submitted: true },
      { number: 2, submitted: true },
    ]);
    expect(max).toBe(Number.MAX_SAFE_INTEGER);
    expect(isWeekUnlocked(2, max)).toBe(true);
  });

  it("sorts by number and always keeps the welcome week (0) open", () => {
    const max = maxUnlockedWeekNumber([
      { number: 2, submitted: true },
      { number: 1, submitted: false },
    ]);
    expect(max).toBe(1); // week 1 is the first incomplete despite input order
    expect(isWeekUnlocked(0, max)).toBe(true); // welcome week never gates
  });

  it("treats an empty program (no assignment weeks) as fully open", () => {
    expect(maxUnlockedWeekNumber([])).toBe(Number.MAX_SAFE_INTEGER);
  });
});
