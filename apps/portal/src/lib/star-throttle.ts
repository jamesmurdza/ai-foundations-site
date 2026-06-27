/**
 * Rate-limit handling for GitHub star writes, kept pure (no I/O) so the
 * classification + backoff math is unit-testable. `github.ts`'s
 * `starRepoThrottled` does the fetch and delegates here; the reconciler
 * (`startrade.ts`) uses `sleep()` to pace requests.
 */
export type StarOutcome = {
  ok: boolean;
  status: number;
  error?: string;
  /** When rate-limited, how long to wait before retrying. */
  retryAfterMs?: number;
  rateLimited?: boolean;
  /** Never retry — repo gone / blocked / unprocessable. */
  permanent?: boolean;
};

type HeaderBag = { get(name: string): string | null };

/** Pause for `ms` milliseconds. */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Classify a GitHub `PUT /user/starred` response for the reconciler, honoring
 * secondary-rate-limit signals (`Retry-After`, `x-ratelimit-remaining`/`reset`).
 * `nowMs` is injected for deterministic reset math in tests.
 */
export function classifyStarResponse(
  status: number,
  headers: HeaderBag,
  nowMs: number = Date.now(),
): StarOutcome {
  if (status === 204) return { ok: true, status };

  if (status === 403 || status === 429) {
    const retryAfter = headers.get("retry-after");
    const remaining = headers.get("x-ratelimit-remaining");
    const reset = headers.get("x-ratelimit-reset");
    let retryAfterMs = 60_000; // conservative default per GitHub guidance
    if (retryAfter && Number.isFinite(Number(retryAfter))) {
      retryAfterMs = Math.max(0, Number(retryAfter) * 1000);
    } else if (remaining === "0" && reset && Number.isFinite(Number(reset))) {
      retryAfterMs = Math.max(0, Number(reset) * 1000 - nowMs);
    }
    return { ok: false, status, rateLimited: true, retryAfterMs, error: `star ${status}` };
  }

  if (status === 404 || status === 451 || status === 422) {
    return { ok: false, status, permanent: true, error: `star ${status}` };
  }

  return { ok: false, status, error: `star ${status}` };
}
