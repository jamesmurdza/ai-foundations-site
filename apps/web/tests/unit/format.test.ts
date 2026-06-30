import { describe, it, expect } from "vitest";
import { timeAgo, toYouTubeEmbed, initials } from "@portal/lib/format";

describe("timeAgo", () => {
  it("shows just now for recent", () => {
    expect(timeAgo(new Date())).toBe("just now");
  });
  it("shows minutes and hours", () => {
    expect(timeAgo(new Date(Date.now() - 5 * 60000))).toBe("5m ago");
    expect(timeAgo(new Date(Date.now() - 3 * 3600000))).toBe("3h ago");
  });
});

describe("toYouTubeEmbed", () => {
  it("handles watch URLs", () => {
    expect(toYouTubeEmbed("https://www.youtube.com/watch?v=abc123")).toBe(
      "https://www.youtube.com/embed/abc123",
    );
  });
  it("handles youtu.be and live URLs", () => {
    expect(toYouTubeEmbed("https://youtu.be/xyz789")).toBe(
      "https://www.youtube.com/embed/xyz789",
    );
    expect(toYouTubeEmbed("https://www.youtube.com/live/LIVE99")).toBe(
      "https://www.youtube.com/embed/LIVE99",
    );
  });
  it("returns null for empty", () => {
    expect(toYouTubeEmbed("")).toBeNull();
  });
});

describe("initials", () => {
  it("takes up to two initials", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
    expect(initials("madonna")).toBe("M");
    expect(initials(null)).toBe("?");
  });
});
