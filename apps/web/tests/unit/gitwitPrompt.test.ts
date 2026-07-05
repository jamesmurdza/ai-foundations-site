import { describe, it, expect } from "vitest";
import { buildProfileSuggestionsPrompt } from "@portal/lib/gitwitTypes";
import type { VerdictWithLabel } from "@portal/lib/gitwitTypes";

const v = (
  id: string,
  label: string,
  met: boolean,
  note = "",
): VerdictWithLabel =>
  ({ id, label, met, note } as unknown as VerdictWithLabel);

describe("buildProfileSuggestionsPrompt", () => {
  it("addresses the user's own profile README repo", () => {
    const prompt = buildProfileSuggestionsPrompt({
      login: "octocat",
      good: [],
      missing: [v("bio", "Add a bio", false, "Your profile has no bio.")],
    });
    expect(prompt).toContain("https://github.com/octocat/octocat");
  });

  it("numbers each missing item with its suggestion note", () => {
    const prompt = buildProfileSuggestionsPrompt({
      login: "octocat",
      good: [],
      missing: [
        v("bio", "Add a bio", false, "Say what you build."),
        v("links", "Add links", false, "Link your site."),
      ],
    });
    expect(prompt).toContain("1. Add a bio — Say what you build.");
    expect(prompt).toContain("2. Add links — Link your site.");
  });

  it("omits the em-dash when a missing item has no note", () => {
    const prompt = buildProfileSuggestionsPrompt({
      login: "octocat",
      good: [],
      missing: [v("skills", "List your skills", false, "")],
    });
    expect(prompt).toContain("1. List your skills");
    expect(prompt).not.toContain("List your skills —");
  });

  it("lists already-covered items so the AI doesn't redo them", () => {
    const prompt = buildProfileSuggestionsPrompt({
      login: "octocat",
      good: [v("picture", "Profile picture", true, "Has one."), v("bio", "Bio", true, "Good bio.")],
      missing: [v("links", "Add links", false, "Link your site.")],
    });
    expect(prompt).toContain("Profile picture, Bio");
  });

  it("has no already-covered line when nothing is covered yet", () => {
    const prompt = buildProfileSuggestionsPrompt({
      login: "octocat",
      good: [],
      missing: [v("links", "Add links", false, "Link your site.")],
    });
    expect(prompt.toLowerCase()).not.toContain("already covered");
  });

  it("closes with an instruction to return paste-ready Markdown", () => {
    const prompt = buildProfileSuggestionsPrompt({
      login: "octocat",
      good: [],
      missing: [v("links", "Add links", false, "Link your site.")],
    });
    expect(prompt).toMatch(/Markdown/);
  });
});
