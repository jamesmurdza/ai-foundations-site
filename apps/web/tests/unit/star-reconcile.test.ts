import { describe, it, expect } from "vitest";
import {
  computePending,
  nextGrantState,
  MAX_ATTEMPTS,
  type Actor,
  type Repo,
  type GrantRow,
} from "@portal/lib/star-reconcile";
import type { StarOutcome } from "@portal/lib/star-throttle";

const actor = (userId: string): Actor => ({
  userId,
  token: `tok-${userId}`,
  login: userId,
  email: `${userId}@x.com`,
  name: userId,
});
const repo = (ownerUserId: string, owner: string, name: string): Repo => ({
  ownerUserId,
  repoOwner: owner,
  repoName: name,
});
const grant = (
  g: Partial<GrantRow> & { fromUserId: string; repoOwner: string; repoName: string },
): GrantRow => ({ ok: false, error: null, attempts: 0, nextAttemptAt: null, ...g });

describe("computePending", () => {
  const A = actor("a");
  const B = actor("b");
  const rA = repo("a", "a", "a"); // owned by A
  const rB = repo("b", "b", "b"); // owned by B

  it("includes new pairs and excludes self-stars", () => {
    const pending = computePending([A, B], [rA, rB], [], 0);
    expect(pending).toHaveLength(2);
    expect(pending.find((p) => p.actor.userId === "a")?.repo.repoOwner).toBe("b");
    expect(pending.find((p) => p.actor.userId === "b")?.repo.repoOwner).toBe("a");
  });

  it("excludes already-starred (ok) pairs", () => {
    const grants = [grant({ fromUserId: "a", repoOwner: "b", repoName: "b", ok: true })];
    expect(computePending([A], [rB], grants, 0)).toHaveLength(0);
  });

  it("excludes manually-unstarred and permanently-parked pairs", () => {
    const unstar = [grant({ fromUserId: "a", repoOwner: "b", repoName: "b", error: "manual_unstar" })];
    expect(computePending([A], [rB], unstar, 0)).toHaveLength(0);
    const perm = [grant({ fromUserId: "a", repoOwner: "b", repoName: "b", error: "permanent" })];
    expect(computePending([A], [rB], perm, 0)).toHaveLength(0);
  });

  it("excludes pairs still backing off, includes them once due (carrying attempts)", () => {
    const now = 1000;
    const backingOff = [grant({ fromUserId: "a", repoOwner: "b", repoName: "b", attempts: 1, nextAttemptAt: new Date(now + 500) })];
    expect(computePending([A], [rB], backingOff, now)).toHaveLength(0);
    const due = [grant({ fromUserId: "a", repoOwner: "b", repoName: "b", attempts: 1, nextAttemptAt: new Date(now - 1) })];
    const p = computePending([A], [rB], due, now);
    expect(p).toHaveLength(1);
    expect(p[0].attempts).toBe(1);
  });
});

describe("nextGrantState", () => {
  const ok: StarOutcome = { ok: true, status: 204 };
  const perm: StarOutcome = { ok: false, status: 404, permanent: true, error: "star 404" };
  const limited: StarOutcome = { ok: false, status: 403, rateLimited: true, retryAfterMs: 30_000, error: "star 403" };
  const transient: StarOutcome = { ok: false, status: 500, error: "star 500" };

  it("success → ok, cleared, attempt counted", () => {
    expect(nextGrantState(0, ok, 0)).toEqual({ ok: true, error: null, attempts: 1, nextAttemptAt: null });
  });
  it("permanent failure → parked, never retried", () => {
    expect(nextGrantState(0, perm, 0)).toEqual({ ok: false, error: "permanent", attempts: 1, nextAttemptAt: null });
  });
  it("rate-limited → reschedules WITHOUT spending an attempt", () => {
    const s = nextGrantState(2, limited, 1000);
    expect(s.ok).toBe(false);
    expect(s.attempts).toBe(2);
    expect(s.nextAttemptAt?.getTime()).toBe(1000 + 30_000);
  });
  it("transient → exponential backoff, then parks permanent at MAX_ATTEMPTS", () => {
    const s = nextGrantState(1, transient, 1000);
    expect(s.attempts).toBe(2);
    expect(s.nextAttemptAt?.getTime()).toBe(1000 + 2 ** 1 * 1000);
    const giveUp = nextGrantState(MAX_ATTEMPTS - 1, transient, 1000);
    expect(giveUp.error).toBe("permanent");
    expect(giveUp.nextAttemptAt).toBeNull();
  });
});
