import { describe, expect, it } from "vitest";
import { rankByNeed, type Need } from "@portal/lib/compliments";

const need = (x: { count: number; at: string }): Need => ({
  count: x.count,
  createdAt: new Date(x.at),
});

describe("rankByNeed", () => {
  it("floats the least-complimented to the top", () => {
    const items = [
      { id: "a", count: 5, at: "2026-01-01" },
      { id: "b", count: 0, at: "2026-01-01" },
      { id: "c", count: 2, at: "2026-01-01" },
    ];
    expect(rankByNeed(items, need).map((i) => i.id)).toEqual(["b", "c", "a"]);
  });

  it("breaks ties oldest-first — whoever has waited longest", () => {
    const items = [
      { id: "new", count: 0, at: "2026-02-01" },
      { id: "old", count: 0, at: "2026-01-01" },
    ];
    expect(rankByNeed(items, need).map((i) => i.id)).toEqual(["old", "new"]);
  });

  it("does not mutate the input array", () => {
    const items = [
      { id: "a", count: 2, at: "2026-01-01" },
      { id: "b", count: 1, at: "2026-01-01" },
    ];
    const before = [...items];
    rankByNeed(items, need);
    expect(items).toEqual(before);
  });

  it("handles an empty list", () => {
    expect(rankByNeed([], need)).toEqual([]);
  });

  // Regression: callers read from unstable_cache, which JSON-serializes Dates
  // into ISO strings. Tie-breaking must not assume a real Date object.
  it("breaks ties when createdAt is a serialized string (not a Date)", () => {
    const items = [
      { id: "newer", count: 0, at: "2026-02-01T00:00:00.000Z" },
      { id: "older", count: 0, at: "2026-01-01T00:00:00.000Z" },
    ];
    const order = rankByNeed(items, (x) => ({ count: x.count, createdAt: x.at }));
    expect(order.map((i) => i.id)).toEqual(["older", "newer"]);
  });
});
