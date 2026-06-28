import { describe, it, expect } from "vitest";
import { validateProfileSubmission } from "@/lib/github-parse";

const ME = "burhankhatri";

describe("validateProfileSubmission — strict, must be the viewer's own profile", () => {
  it("accepts the user's own profile URL", () => {
    const r = validateProfileSubmission("https://github.com/burhankhatri", ME);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.login).toBe("burhankhatri");
  });

  it("accepts the user's own profile README repo URL", () => {
    expect(
      validateProfileSubmission("https://github.com/burhankhatri/burhankhatri", ME).ok,
    ).toBe(true);
  });

  it("accepts the README file URL", () => {
    expect(
      validateProfileSubmission(
        "https://github.com/burhankhatri/burhankhatri/blob/main/README.md",
        ME,
      ).ok,
    ).toBe(true);
  });

  it("accepts a bare username that matches (case-insensitive)", () => {
    expect(validateProfileSubmission("BurhanKhatri", ME).ok).toBe(true);
  });

  it("rejects someone else's profile as not_yours", () => {
    const r = validateProfileSubmission("https://github.com/torvalds", ME);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("not_yours");
  });

  it("rejects a specific non-profile repo as wrong_repo", () => {
    const r = validateProfileSubmission(
      "https://github.com/burhankhatri/some-project",
      ME,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("wrong_repo");
  });

  it("rejects a non-GitHub link as not_github", () => {
    const r = validateProfileSubmission("https://linkedin.com/in/burhankhatri", ME);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("not_github");
  });

  it("rejects empty input", () => {
    const r = validateProfileSubmission("", ME);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("empty");
  });

  it("without a known login: still rejects non-profile repos and non-github links", () => {
    expect(validateProfileSubmission("https://github.com/foo/bar", null).ok).toBe(false);
    expect(validateProfileSubmission("https://example.com", null).ok).toBe(false);
    // ...but can't verify ownership, so a bare profile passes
    expect(validateProfileSubmission("https://github.com/foo", null).ok).toBe(true);
  });

  it("every rejection carries a non-empty, actionable message", () => {
    for (const bad of [
      "",
      "https://example.com",
      "https://github.com/torvalds",
      "https://github.com/burhankhatri/some-project",
    ]) {
      const r = validateProfileSubmission(bad, ME);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.message.length).toBeGreaterThan(10);
    }
  });

  it("allowAnyOwner (admin) bypasses the not_yours check", () => {
    const r = validateProfileSubmission("https://github.com/torvalds", ME, {
      allowAnyOwner: true,
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.login).toBe("torvalds");
  });

  it("allowAnyOwner still enforces link structure (wrong_repo, not_github)", () => {
    expect(
      validateProfileSubmission("https://github.com/torvalds/linux", ME, {
        allowAnyOwner: true,
      }).ok,
    ).toBe(false);
    expect(
      validateProfileSubmission("https://example.com", ME, { allowAnyOwner: true })
        .ok,
    ).toBe(false);
  });
});
