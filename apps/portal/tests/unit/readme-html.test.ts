import { describe, it, expect } from "vitest";
import { decodeCamoUrl, unwrapReadmeImageUrls } from "@/lib/readme-html";

describe("decodeCamoUrl", () => {
  it("decodes a camo hex payload to the original URL", () => {
    const camo =
      "https://camo.githubusercontent.com/31b9f1975b8ab958bf5536c8e95664407405a9b2f012535c05624ca185224a72/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f73746172732f62757268616e6b68617472692f6532652d74657374696e673f7374796c653d666c61742d737175617265266c6162656c436f6c6f723d30443131313726636f6c6f723d374333414544";
    expect(decodeCamoUrl(camo)).toBe(
      "https://img.shields.io/github/stars/burhankhatri/e2e-testing?style=flat-square&labelColor=0D1117&color=7C3AED",
    );
  });
});

describe("unwrapReadmeImageUrls", () => {
  it("prefers data-canonical-src over camo src", () => {
    const html =
      '<img src="https://camo.githubusercontent.com/abc/6864747470733a2f2f6578616d706c652e636f6d" alt="Stars" data-canonical-src="https://img.shields.io/github/stars/octocat/repo?style=flat-square" style="max-width: 100%;">';
    const out = unwrapReadmeImageUrls(html);
    expect(out).toContain('src="https://img.shields.io/github/stars/octocat/repo?style=flat-square"');
    expect(out).not.toContain("camo.githubusercontent.com");
    expect(out).not.toContain("data-canonical-src");
    expect(out).toContain('referrerpolicy="no-referrer"');
  });

  it("decodes camo src when no canonical attribute is present", () => {
    const html =
      '<img src="https://camo.githubusercontent.com/31b9f1975b8ab958bf5536c8e95664407405a9b2f012535c05624ca185224a72/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f73746172732f62757268616e6b68617472692f6532652d74657374696e673f7374796c653d666c61742d737175617265266c6162656c436f6c6f723d30443131313726636f6c6f723d374333414544" alt="Stars">';
    const out = unwrapReadmeImageUrls(html);
    expect(out).toContain("img.shields.io/github/stars/burhankhatri/e2e-testing");
    expect(out).not.toContain("camo.githubusercontent.com");
  });
});
