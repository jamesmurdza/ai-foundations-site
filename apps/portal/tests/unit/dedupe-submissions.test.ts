import { describe, it, expect } from "vitest";
import { pickKeeper } from "@/scripts/dedupe-submissions";

describe("pickKeeper", () => {
  it("keeps the newest submission by createdAt", () => {
    const rows = [
      { id: "a", createdAt: "2026-06-01T00:00:00Z" },
      { id: "c", createdAt: "2026-06-09T00:00:00Z" },
      { id: "b", createdAt: "2026-06-05T00:00:00Z" },
    ];
    expect(pickKeeper(rows).id).toBe("c");
  });

  it("handles Date objects and a single row", () => {
    const rows = [
      { id: "x", createdAt: new Date("2020-01-01") },
      { id: "y", createdAt: new Date("2024-01-01") },
    ];
    expect(pickKeeper(rows).id).toBe("y");
    expect(pickKeeper([{ id: "solo", createdAt: new Date() }]).id).toBe("solo");
  });
});
