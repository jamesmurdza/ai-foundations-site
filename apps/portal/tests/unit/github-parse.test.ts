import { describe, it, expect } from "vitest";
import { parseRepo, parseLogin, normalizeUrl, deriveRepoRef } from "@/lib/github-parse";

describe("parseRepo", () => {
  it("parses full https github URLs", () => {
    expect(parseRepo("https://github.com/burhankhatri/AIFoundationsSummerSchool")).toEqual({
      owner: "burhankhatri",
      repo: "AIFoundationsSummerSchool",
    });
  });
  it("strips trailing .git and paths", () => {
    expect(parseRepo("https://github.com/acme/widget.git")).toEqual({
      owner: "acme",
      repo: "widget",
    });
    expect(parseRepo("github.com/acme/widget/tree/main")).toEqual({
      owner: "acme",
      repo: "widget",
    });
  });
  it("parses owner/repo shorthand", () => {
    expect(parseRepo("acme/widget")).toEqual({ owner: "acme", repo: "widget" });
  });
  it("returns null for non-repos", () => {
    expect(parseRepo("https://example.com")).toBeNull();
    expect(parseRepo("")).toBeNull();
    expect(parseRepo(null)).toBeNull();
  });
});

describe("parseLogin", () => {
  it("parses a profile URL", () => {
    expect(parseLogin("https://github.com/burhankhatri")).toBe("burhankhatri");
  });
  it("parses @handle and bare handle", () => {
    expect(parseLogin("@burhankhatri")).toBe("burhankhatri");
    expect(parseLogin("burhankhatri")).toBe("burhankhatri");
  });
});

describe("deriveRepoRef", () => {
  it("returns the repo for a github repo link", () => {
    expect(deriveRepoRef("https://github.com/acme/widget")).toEqual({ owner: "acme", repo: "widget" });
    expect(deriveRepoRef("github.com/acme/widget/tree/main")).toEqual({ owner: "acme", repo: "widget" });
    expect(deriveRepoRef("acme/widget")).toEqual({ owner: "acme", repo: "widget" });
  });
  it("derives the <login>/<login> profile README repo for a bare profile link", () => {
    expect(deriveRepoRef("https://github.com/taniya")).toEqual({ owner: "taniya", repo: "taniya" });
    // trailing slash (how Week 1 links were actually stored)
    expect(deriveRepoRef("https://github.com/jamesmurdza/")).toEqual({ owner: "jamesmurdza", repo: "jamesmurdza" });
  });
  it("returns null for non-github payloads, text, and bare words", () => {
    expect(deriveRepoRef("https://example.com/me")).toBeNull();
    expect(deriveRepoRef("just some text")).toBeNull();
    expect(deriveRepoRef("mycoolproject")).toBeNull();
    expect(deriveRepoRef("")).toBeNull();
    expect(deriveRepoRef(null)).toBeNull();
  });
});

describe("normalizeUrl", () => {
  it("prepends https:// to scheme-less hosts (GitHub blog field)", () => {
    expect(normalizeUrl("burhankhatri.com")).toBe("https://burhankhatri.com");
    expect(normalizeUrl("  www.example.com ")).toBe("https://www.example.com");
  });
  it("leaves absolute http(s) and mailto URLs untouched", () => {
    expect(normalizeUrl("https://x.com/a")).toBe("https://x.com/a");
    expect(normalizeUrl("http://y.com")).toBe("http://y.com");
    expect(normalizeUrl("mailto:a@b.com")).toBe("mailto:a@b.com");
  });
  it("returns null for empty input", () => {
    expect(normalizeUrl("")).toBeNull();
    expect(normalizeUrl(null)).toBeNull();
    expect(normalizeUrl(undefined)).toBeNull();
  });
});
