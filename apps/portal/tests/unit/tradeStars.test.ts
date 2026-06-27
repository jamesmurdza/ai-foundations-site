import { describe, it, expect } from "vitest";
import { canEnableTradeStars } from "@/lib/tradeStars";

describe("canEnableTradeStars", () => {
  it("allows enabling only with a connected GitHub (access token)", () => {
    expect(canEnableTradeStars({ accessToken: "gho_realtoken" })).toBe(true);
  });
  it("blocks enabling without a token (email-only accounts)", () => {
    expect(canEnableTradeStars({ accessToken: null })).toBe(false);
    expect(canEnableTradeStars({ accessToken: "" })).toBe(false);
  });
});
