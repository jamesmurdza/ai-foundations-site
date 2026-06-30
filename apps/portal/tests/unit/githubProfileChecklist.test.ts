import { describe, it, expect } from "vitest";
import {
  GITHUB_PROFILE_CHECKLIST,
  githubProfileStepKey,
  isGitHubProfileStepKey,
  buildGitHubProfileChecklistItems,
} from "@/lib/githubProfileChecklist";

describe("githubProfileChecklist", () => {
  it("defines seven trackable profile + README items", () => {
    expect(GITHUB_PROFILE_CHECKLIST).toHaveLength(7);
    expect(GITHUB_PROFILE_CHECKLIST.filter((i) => i.group === "profile")).toHaveLength(3);
    expect(GITHUB_PROFILE_CHECKLIST.filter((i) => i.group === "readme")).toHaveLength(4);
  });

  it("prefixes step keys for week completion storage", () => {
    expect(githubProfileStepKey("bio")).toBe("github-profile-bio");
    expect(isGitHubProfileStepKey("github-profile-bio")).toBe(true);
    expect(isGitHubProfileStepKey("follow-peers")).toBe(false);
  });

  it("builds checklist items from saved completions", () => {
    const items = buildGitHubProfileChecklistItems(
      new Map([["github-profile-bio", true]]),
    );
    expect(items.find((i) => i.key === "github-profile-bio")?.done).toBe(true);
    expect(items.find((i) => i.key === "github-profile-picture")?.done).toBe(false);
  });
});
