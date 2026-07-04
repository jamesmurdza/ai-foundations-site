import { describe, it, expect } from "vitest";
import {
  weekSubmissionPath,
  weekAssignmentHomePath,
  parseWeekRouteParam,
  isSubmissionUuid,
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
