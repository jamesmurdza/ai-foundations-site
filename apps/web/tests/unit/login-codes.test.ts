import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { classifyCode, mayRequestLoginCode } from "@portal/lib/login-codes";

// Mirrors the private hash in login-codes.ts (sha256 of the trimmed code).
const h = (c: string) => createHash("sha256").update(c.trim()).digest("hex");
const future = () => new Date(Date.now() + 60_000);
const past = () => new Date(Date.now() - 60_000);

describe("classifyCode", () => {
  it("ok for a matching, unexpired code", () => {
    const row = { codeHash: h("123456"), expiresAt: future(), attempts: 0 };
    expect(classifyCode(row, "123456")).toBe("ok");
  });

  it("ignores surrounding whitespace (autofill / paste)", () => {
    const row = { codeHash: h("123456"), expiresAt: future(), attempts: 0 };
    expect(classifyCode(row, "  123456 ")).toBe("ok");
  });

  it("wrong for a mismatched code", () => {
    const row = { codeHash: h("123456"), expiresAt: future(), attempts: 0 };
    expect(classifyCode(row, "000000")).toBe("wrong");
  });

  it("expired once past expiry — even if the digits are correct", () => {
    const row = { codeHash: h("123456"), expiresAt: past(), attempts: 0 };
    expect(classifyCode(row, "123456")).toBe("expired");
  });

  it("expired when there is no live code (resend superseded it)", () => {
    expect(classifyCode(undefined, "123456")).toBe("expired");
  });

  it("locked after too many attempts", () => {
    const row = { codeHash: h("123456"), expiresAt: future(), attempts: 6 };
    expect(classifyCode(row, "123456")).toBe("locked");
  });
});

describe("mayRequestLoginCode — open sign-up, no applicant/admin requirement", () => {
  it("issues a code to anyone with a well-formed email — applicant or total stranger", () => {
    expect(mayRequestLoginCode("taniyasouza@gmail.com")).toBe(true);
    expect(mayRequestLoginCode("a-total-stranger@example.com")).toBe(true);
  });

  it("trims surrounding whitespace before deciding", () => {
    expect(mayRequestLoginCode("  someone@somewhere.io  ")).toBe(true);
  });

  it("declines input that isn't an email address", () => {
    expect(mayRequestLoginCode("not-an-email")).toBe(false);
    expect(mayRequestLoginCode("")).toBe(false);
    expect(mayRequestLoginCode("   ")).toBe(false);
  });
});
