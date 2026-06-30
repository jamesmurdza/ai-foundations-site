import { describe, it, expect } from "vitest";
import { classifyStarResponse } from "@portal/lib/star-throttle";

const hdr = (o: Record<string, string>) => new Headers(o);

describe("classifyStarResponse", () => {
  it("204 → ok", () => {
    expect(classifyStarResponse(204, hdr({}))).toEqual({ ok: true, status: 204 });
  });

  it("403 with Retry-After → rate-limited, waits that many seconds", () => {
    const r = classifyStarResponse(403, hdr({ "retry-after": "30" }));
    expect(r.ok).toBe(false);
    expect(r.rateLimited).toBe(true);
    expect(r.retryAfterMs).toBe(30_000);
  });

  it("429 with x-ratelimit-remaining 0 → waits until reset epoch", () => {
    const now = 1_700_000_000_000;
    const resetSec = now / 1000 + 45;
    const r = classifyStarResponse(
      429,
      hdr({ "x-ratelimit-remaining": "0", "x-ratelimit-reset": String(resetSec) }),
      now,
    );
    expect(r.rateLimited).toBe(true);
    expect(r.retryAfterMs).toBe(45_000);
  });

  it("403 with no rate-limit headers → conservative 60s default", () => {
    expect(classifyStarResponse(403, hdr({})).retryAfterMs).toBe(60_000);
  });

  it("404 / 451 / 422 → permanent (never retry)", () => {
    expect(classifyStarResponse(404, hdr({})).permanent).toBe(true);
    expect(classifyStarResponse(451, hdr({})).permanent).toBe(true);
    expect(classifyStarResponse(422, hdr({})).permanent).toBe(true);
  });

  it("other failures → transient error, not permanent or rate-limited", () => {
    const r = classifyStarResponse(500, hdr({}));
    expect(r.ok).toBe(false);
    expect(r.permanent).toBeFalsy();
    expect(r.rateLimited).toBeFalsy();
    expect(r.error).toBe("star 500");
  });
});
