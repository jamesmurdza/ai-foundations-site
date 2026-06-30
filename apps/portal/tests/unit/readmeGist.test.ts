import { describe, it, expect } from "vitest";
import { readmeGist } from "@/lib/readme-html";

describe("readmeGist", () => {
  it("strips markdown formatting to plain text", () => {
    const md = "# My Project\n\nA **cool** tool with [docs](https://x.com) and `code`.";
    expect(readmeGist(md)).toBe("My Project A cool tool with docs and code.");
  });

  it("drops images/badges and fenced code blocks", () => {
    const md = "![badge](https://img.shields.io/x)\n\n```js\nconst x = 1;\n```\nHello world.";
    expect(readmeGist(md)).toBe("Hello world.");
  });

  it("truncates with an ellipsis at a word boundary", () => {
    const g = readmeGist("word ".repeat(100), 40);
    expect(g.length).toBeLessThanOrEqual(41);
    expect(g.endsWith("…")).toBe(true);
    expect(g).not.toContain("wor…"); // cut on a space, not mid-word
  });

  it("returns empty string for empty input", () => {
    expect(readmeGist("")).toBe("");
  });

  it("decodes HTML entities so the gist reads naturally", () => {
    // The real bug: profile READMEs embed &amp; / &nbsp; (markdown + HTML).
    expect(readmeGist("designs systems &amp; code &nbsp; &nbsp; for humans")).toBe(
      "designs systems & code for humans",
    );
  });

  it("decodes numeric and hex entities", () => {
    expect(readmeGist("a &#38; b &#x2014; c")).toBe("a & b — c");
  });

  it("strips horizontal rules between sections", () => {
    expect(readmeGist("Intro line.\n\n---\n\n## About\nMore text.")).toBe(
      "Intro line. About More text.",
    );
  });
});
