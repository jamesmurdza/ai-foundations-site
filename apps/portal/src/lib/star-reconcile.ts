/**
 * Pure decision logic for the auto-star reconciler (no DB / I/O) so it's
 * unit-testable. `startrade.ts` does the queries + throttled GitHub writes and
 * delegates the "what to star next" and "how to record an attempt" decisions
 * here.
 */
import type { StarOutcome } from "./star-throttle";

export type Actor = {
  userId: string;
  token: string;
  login: string | null;
  email: string | null;
  name: string | null;
};
export type Repo = { ownerUserId: string; repoOwner: string; repoName: string };
export type GrantRow = {
  fromUserId: string;
  repoOwner: string | null;
  repoName: string | null;
  ok: boolean;
  error: string | null;
  attempts: number;
  nextAttemptAt: Date | null;
};
export type PendingPair = { actor: Actor; repo: Repo; attempts: number };
export type GrantState = {
  ok: boolean;
  error: string | null;
  attempts: number;
  nextAttemptAt: Date | null;
};

/** Retry budget before a transient failure is parked as `permanent`. */
export const MAX_ATTEMPTS = 5;

/**
 * The (actor, repo) pairs still needing a star — the resumable work queue,
 * derived purely from current state. Desired pairs minus: self-stars, successes
 * (`ok`), parked rows (`manual_unstar`/`permanent`), and pairs still inside
 * their backoff window (`nextAttemptAt > now`).
 */
export function computePending(
  actors: Actor[],
  repos: Repo[],
  grants: GrantRow[],
  nowMs: number,
): PendingPair[] {
  const byKey = new Map<string, GrantRow>();
  for (const g of grants) {
    if (g.repoOwner && g.repoName) {
      byKey.set(`${g.fromUserId}|${g.repoOwner}/${g.repoName}`, g);
    }
  }
  const pending: PendingPair[] = [];
  for (const actor of actors) {
    for (const repo of repos) {
      if (repo.ownerUserId === actor.userId) continue; // never self-star
      const g = byKey.get(`${actor.userId}|${repo.repoOwner}/${repo.repoName}`);
      if (!g) {
        pending.push({ actor, repo, attempts: 0 });
        continue;
      }
      if (g.ok) continue; // already starred
      if (g.error === "manual_unstar" || g.error === "permanent") continue; // parked
      if (g.nextAttemptAt && g.nextAttemptAt.getTime() > nowMs) continue; // backing off
      pending.push({ actor, repo, attempts: g.attempts });
    }
  }
  return pending;
}

/**
 * The next persisted grant state for a star attempt. Rate limits reschedule
 * without spending an attempt; transient failures back off exponentially and
 * park as `permanent` after {@link MAX_ATTEMPTS}.
 */
export function nextGrantState(
  attempts: number,
  outcome: StarOutcome,
  nowMs: number,
): GrantState {
  if (outcome.ok) {
    return { ok: true, error: null, attempts: attempts + 1, nextAttemptAt: null };
  }
  if (outcome.permanent) {
    return { ok: false, error: "permanent", attempts: attempts + 1, nextAttemptAt: null };
  }
  if (outcome.rateLimited) {
    // A rate limit isn't the repo's fault — reschedule without spending an attempt.
    return {
      ok: false,
      error: outcome.error ?? "rate_limited",
      attempts,
      nextAttemptAt: new Date(nowMs + (outcome.retryAfterMs ?? 60_000)),
    };
  }
  const a = attempts + 1;
  if (a >= MAX_ATTEMPTS) {
    return { ok: false, error: "permanent", attempts: a, nextAttemptAt: null };
  }
  const backoffMs = Math.min(2 ** attempts, 60) * 1000;
  return {
    ok: false,
    error: outcome.error ?? "star",
    attempts: a,
    nextAttemptAt: new Date(nowMs + backoffMs),
  };
}
