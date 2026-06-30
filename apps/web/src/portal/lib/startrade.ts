import "server-only";
import { revalidateTag } from "next/cache";
import { and, eq, gt, inArray, isNotNull } from "drizzle-orm";
import { db } from "@portal/db";
import {
  submissions,
  profiles,
  starGrants,
  users,
  githubSnapshots,
  emailLogs,
} from "@portal/db/schema";
import { starRepoThrottled, getGithubStats } from "./github";
import { sleep } from "./star-throttle";
import {
  computePending,
  nextGrantState,
  type Actor,
  type Repo,
  type GrantRow,
  type PendingPair,
} from "./star-reconcile";
import { sendEmail, templates } from "./email";
import { recordEvent } from "./events";

type Member = {
  userId: string;
  token: string | null;
  login: string | null;
  email: string | null;
  name: string | null;
};

// Abuse-safety knobs. Writes are serialized per token and paced ~1/sec; each
// drain does a bounded number of writes so it fits inside the function budget
// and the rest resumes on the next invocation (cron / trigger).
const PER_TOKEN_DELAY_MS = 1100;
const MAX_WRITES_PER_RUN = 100;

/**
 * Auto-star ("Trade Stars") is active whenever the user opts in. The argument is
 * kept for older callers/tests that used to model the week gate.
 */
export function weekAllowsAutoStar(_weekNumber: number | null): boolean {
  return true;
}

export async function autoStarActive(): Promise<boolean> {
  return true;
}

/**
 * Whether `actor` still needs to star this repo. Retained for back-compat; the
 * reconciler now decides via `computePending`. Skips already-starred,
 * manually-unstarred, and permanently-failed pairs.
 */
export function needsStar(
  existing:
    | {
        ok: boolean;
        repoOwner: string | null;
        repoName: string | null;
        error?: string | null;
      }
    | undefined,
  target: { repoOwner: string; repoName: string },
): boolean {
  if (!existing) return true;
  if (existing.error === "manual_unstar" || existing.error === "permanent") return false;
  if (!existing.ok) return true;
  return (
    existing.repoOwner !== target.repoOwner ||
    existing.repoName !== target.repoName
  );
}

/**
 * Auto Trade Stars — one bounded, throttled, resumable drain. Every opted-in,
 * GitHub-connected member stars every submitted repo (any assignment/week). The
 * pending set (computePending) is derived from `ss_star_grants`, so runs are
 * idempotent and resumable: each invocation stars up to MAX_WRITES_PER_RUN pairs
 * (serialized per token, paced ~1/sec, obeying GitHub's rate-limit signals) and
 * the rest carries to the next invocation (Vercel cron / triggers). Following is
 * NOT done here — that's a manual per-profile action (lib/actions/follow.ts).
 */
export async function runStarTrade(limit: number = MAX_WRITES_PER_RUN): Promise<{
  actors: number;
  repos: number;
  stars: number;
  errors: number;
  pendingRemaining: number;
}> {
  const members: Member[] = await db
    .select({
      userId: profiles.userId,
      token: users.accessToken,
      login: users.githubLogin,
      email: users.email,
      name: users.name,
    })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .where(eq(profiles.tradeStarsEnabled, true));
  const memberById = new Map(members.map((m) => [m.userId, m]));
  const actors: Actor[] = members.filter((m): m is Actor => Boolean(m.token));
  if (actors.length === 0) {
    return { actors: 0, repos: 0, stars: 0, errors: 0, pendingRemaining: 0 };
  }

  // Every distinct submitted repo (any assignment). Opt-in controls who gives
  // stars; non-opted-in builders still receive them.
  const repoRows = await db
    .selectDistinct({
      ownerUserId: submissions.userId,
      repoOwner: submissions.repoOwner,
      repoName: submissions.repoName,
    })
    .from(submissions)
    .where(and(isNotNull(submissions.repoOwner), isNotNull(submissions.repoName)));
  const repos: Repo[] = repoRows.map((r) => ({
    ownerUserId: r.ownerUserId,
    repoOwner: r.repoOwner as string,
    repoName: r.repoName as string,
  }));

  // One bulk query for all of these actors' grants (replaces the per-pair SELECT
  // — Neon-friendly: ~3 reads total regardless of the actor×repo matrix size).
  const grantRows: GrantRow[] = await db
    .select({
      fromUserId: starGrants.fromUserId,
      repoOwner: starGrants.repoOwner,
      repoName: starGrants.repoName,
      ok: starGrants.ok,
      error: starGrants.error,
      attempts: starGrants.attempts,
      nextAttemptAt: starGrants.nextAttemptAt,
    })
    .from(starGrants)
    .where(
      and(
        eq(starGrants.kind, "star"),
        inArray(
          starGrants.fromUserId,
          actors.map((a) => a.userId),
        ),
      ),
    );

  const pending = computePending(actors, repos, grantRows, Date.now());

  // Group by actor so writes are serialized per token (GitHub abuse-safety).
  const byActor = new Map<string, PendingPair[]>();
  for (const p of pending) {
    const list = byActor.get(p.actor.userId);
    if (list) list.push(p);
    else byActor.set(p.actor.userId, [p]);
  }

  let writes = 0;
  let stars = 0;
  let errors = 0;
  const starsReceived = new Map<string, number>();

  outer: for (const items of byActor.values()) {
    for (const { actor, repo, attempts } of items) {
      if (writes >= limit) break outer;
      const outcome = await starRepoThrottled(actor.token, repo.repoOwner, repo.repoName);
      writes++;
      const state = nextGrantState(attempts, outcome, Date.now());
      await db
        .insert(starGrants)
        .values({
          fromUserId: actor.userId,
          toUserId: repo.ownerUserId,
          kind: "star",
          repoOwner: repo.repoOwner,
          repoName: repo.repoName,
          ok: state.ok,
          error: state.error,
          attempts: state.attempts,
          nextAttemptAt: state.nextAttemptAt,
        })
        .onConflictDoUpdate({
          target: [starGrants.fromUserId, starGrants.repoOwner, starGrants.repoName],
          set: {
            toUserId: repo.ownerUserId,
            ok: state.ok,
            error: state.error,
            attempts: state.attempts,
            nextAttemptAt: state.nextAttemptAt,
          },
        });
      if (state.ok) {
        stars++;
        starsReceived.set(
          repo.ownerUserId,
          (starsReceived.get(repo.ownerUserId) ?? 0) + 1,
        );
      } else {
        errors++;
      }
      // Secondary rate limit on this token → stop this actor for the run (the
      // grant's nextAttemptAt reschedules it); move to the next token.
      if (outcome.rateLimited) break;
      await sleep(PER_TOKEN_DELAY_MS); // pace mutating requests (~1/sec/token)
    }
  }

  await notifyStarRecipients(starsReceived, memberById, stars);

  // Shared star engine — invalidate the star + profile caches once, centrally.
  revalidateTag("stars", { expire: 0 });
  revalidateTag("profiles", { expire: 0 });
  return {
    actors: actors.length,
    repos: repos.length,
    stars,
    errors,
    pendingRemaining: Math.max(0, pending.length - writes),
  };
}

const DIGEST_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Notify recipients of new stars — debounced for bulk backfills: ONE aggregate
 * pulse event per drain (not one per recipient), and at most one "you earned
 * stars" email per recipient per 24h (deduped via ss_email_logs).
 */
async function notifyStarRecipients(
  starsReceived: Map<string, number>,
  memberById: Map<string, Member>,
  totalStars: number,
): Promise<void> {
  if (totalStars === 0) return;

  void recordEvent({
    type: "star",
    actorName: "The cohort",
    summary: `The cohort traded ${totalStars} star${totalStars === 1 ? "" : "s"}`,
    meta: { count: totalStars },
  });

  const since = new Date(Date.now() - DIGEST_WINDOW_MS);
  for (const [userId, count] of starsReceived) {
    const m = memberById.get(userId);
    if (!m?.email || count <= 0) continue;
    const [recent] = await db
      .select({ id: emailLogs.id })
      .from(emailLogs)
      .where(
        and(
          eq(emailLogs.userId, userId),
          eq(emailLogs.type, "starred"),
          gt(emailLogs.createdAt, since),
        ),
      )
      .limit(1);
    if (recent) continue; // already emailed within the window
    const t = templates.starred(count);
    void sendEmail({
      to: m.email,
      type: "starred",
      subject: t.subject,
      html: t.html,
      userId,
    });
    if (m.login) void refreshLatestSnapshot(userId, m.login, m.token ?? undefined);
  }
}

export async function refreshLatestSnapshot(
  userId: string,
  login: string,
  token?: string,
): Promise<void> {
  try {
    const stats = await getGithubStats(login, token);
    if (!stats) return;
    const existing = await db
      .select({ id: githubSnapshots.id })
      .from(githubSnapshots)
      .where(
        and(
          eq(githubSnapshots.userId, userId),
          eq(githubSnapshots.phase, "latest"),
        ),
      )
      .limit(1);
    if (existing.length) {
      await db
        .update(githubSnapshots)
        .set({ ...stats, capturedAt: new Date() })
        .where(eq(githubSnapshots.id, existing[0].id));
    } else {
      await db
        .insert(githubSnapshots)
        .values({ userId, phase: "latest", ...stats });
    }
  } catch (e) {
    console.error("[startrade] latest snapshot failed", e);
  }
}
