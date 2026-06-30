import { describe, it, expect } from "vitest";
import { centroidFor, project, normalizeCountry, displayCountry } from "@portal/lib/countries";

describe("centroidFor", () => {
  it("resolves direct names case-insensitively", () => {
    expect(centroidFor("Pakistan")).toEqual([69.3, 30.4]);
    expect(centroidFor("pakistan")).toEqual([69.3, 30.4]);
  });
  it("resolves aliases", () => {
    expect(centroidFor("USA")).toEqual(centroidFor("united states"));
    expect(centroidFor("UK")).toEqual(centroidFor("united kingdom"));
  });
  it("returns null for unknown", () => {
    expect(centroidFor("Atlantis")).toBeNull();
  });
});

describe("normalizeCountry (real messy applicant values)", () => {
  it("handles casing and direct names", () => {
    expect(normalizeCountry("Pakistan")).toBe("pakistan");
    expect(normalizeCountry("PAKISTAN")).toBe("pakistan");
  });
  it("handles aliases, codes and scripts", () => {
    expect(normalizeCountry("Usa")).toBe("united states");
    expect(normalizeCountry("中国")).toBe("china");
    expect(normalizeCountry("Viet Nam")).toBe("vietnam");
    expect(normalizeCountry("Türkiye")).toBe("turkey");
    expect(normalizeCountry("Uae")).toBe("united arab emirates");
    expect(normalizeCountry("Ug")).toBe("uganda");
    expect(normalizeCountry("Id")).toBe("indonesia");
  });
  it("handles 'City, Country' and phrases", () => {
    expect(normalizeCountry("Sydney, Australia")).toBe("australia");
    expect(normalizeCountry("Pemalang, Indonesia")).toBe("indonesia");
    expect(normalizeCountry("Noida, India")).toBe("india");
    expect(normalizeCountry("West Bengal, India")).toBe("india");
    expect(normalizeCountry("I live in Republic of Korea, South.")).toBe("south korea");
  });
  it("returns null for junk", () => {
    expect(normalizeCountry("Xyz")).toBeNull();
    expect(normalizeCountry("")).toBeNull();
    expect(normalizeCountry(null)).toBeNull();
  });
});

describe("displayCountry", () => {
  it("title-cases canonical keys", () => {
    expect(displayCountry("united arab emirates")).toBe("United Arab Emirates");
    expect(displayCountry("south korea")).toBe("South Korea");
  });
});

describe("project", () => {
  it("maps lon/lat to the box corners", () => {
    expect(project(-180, 90, 1000, 500)).toEqual([0, 0]);
    expect(project(180, -90, 1000, 500)).toEqual([1000, 500]);
    expect(project(0, 0, 1000, 500)).toEqual([500, 250]);
  });
});
