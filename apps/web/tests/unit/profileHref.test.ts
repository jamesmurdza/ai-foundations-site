import { describe, it, expect } from "vitest";
import { profileHref } from "@portal/lib/profileHref";

describe("profileHref", () => {
  it("prefers the GitHub-mirror /users URL when a login exists", () => {
    expect(profileHref({ login: "octocat", profileId: "p1" })).toBe("/users/octocat");
  });
  it("falls back to /profiles/[id] without a login", () => {
    expect(profileHref({ login: null, profileId: "p1" })).toBe("/profiles/p1");
  });
  it("falls back to /discover when neither is present", () => {
    expect(profileHref({ login: null, profileId: null })).toBe("/discover");
    expect(profileHref({})).toBe("/discover");
  });
});
