import { describe, expect, it } from "vitest";
import { jitterForId } from "@/lib/mapJitter";

describe("jitterForId", () => {
  it("is deterministic for the same id", () => {
    const a = jitterForId("profile-abc", 100, 200);
    const b = jitterForId("profile-abc", 100, 200);
    expect(a).toEqual(b);
  });

  it("offsets from the centroid", () => {
    const [cx, cy] = jitterForId("profile-xyz", 400, 250);
    const dist = Math.hypot(cx - 400, cy - 250);
    expect(dist).toBeGreaterThanOrEqual(12);
    expect(dist).toBeLessThanOrEqual(28);
  });

  it("spreads different ids apart", () => {
    const a = jitterForId("id-one", 500, 300);
    const b = jitterForId("id-two", 500, 300);
    expect(a).not.toEqual(b);
  });
});
