import { describe, it, expect } from "vitest";
import { slugifyUsername, isValidUsername } from "@portal/lib/username";

describe("slugifyUsername", () => {
  it("lowercases and keeps github-style handles", () => {
    expect(slugifyUsername("BurhanKhatri")).toBe("burhankhatri");
    expect(slugifyUsername("octo-cat")).toBe("octo-cat");
  });

  it("collapses spaces and symbols into single hyphens", () => {
    expect(slugifyUsername("Abdul Rehman!!")).toBe("abdul-rehman");
    expect(slugifyUsername("a@@@b")).toBe("a-b");
  });

  it("trims stray hyphens and caps length at 24", () => {
    expect(slugifyUsername("--hi--")).toBe("hi");
    expect(slugifyUsername("x".repeat(40)).length).toBeLessThanOrEqual(24);
  });

  it("falls back to 'user' when nothing usable remains", () => {
    expect(slugifyUsername("")).toBe("user");
    expect(slugifyUsername("!")).toBe("user");
  });
});

describe("isValidUsername", () => {
  it("accepts lowercase alphanumeric + interior hyphens", () => {
    expect(isValidUsername("burhan")).toBe(true);
    expect(isValidUsername("octo-cat")).toBe(true);
    expect(isValidUsername("a1")).toBe(true);
  });

  it("rejects uppercase, spaces, underscores, and edge hyphens", () => {
    expect(isValidUsername("Burhan")).toBe(false);
    expect(isValidUsername("a b")).toBe(false);
    expect(isValidUsername("a_b")).toBe(false);
    expect(isValidUsername("-ab")).toBe(false);
    expect(isValidUsername("ab-")).toBe(false);
  });
});
