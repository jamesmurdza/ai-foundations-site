import { describe, it, expect } from "vitest";
import { extractMentions } from "@portal/lib/mentions";

describe("extractMentions", () => {
  it("pulls unique, lowercased handles", () => {
    expect(extractMentions("hey @Burhan and @octo-cat — nice!")).toEqual([
      "burhan",
      "octo-cat",
    ]);
  });

  it("dedupes repeats regardless of case", () => {
    expect(extractMentions("@team @team @Team")).toEqual(["team"]);
  });

  it("needs at least two characters after the @", () => {
    expect(extractMentions("@a hi")).toEqual([]);
  });

  it("returns nothing when there are no mentions", () => {
    expect(extractMentions("just a plain announcement")).toEqual([]);
  });
});
