import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { desc } from "drizzle-orm";
import { db } from "@portal/db";
import { events } from "@portal/db/schema";
import type { Event } from "@portal/db/schema";

export type NewEvent = {
  type: string;
  summary: string;
  actorId?: string | null;
  actorName?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  weekId?: string | null;
  meta?: Record<string, unknown> | null;
};

/** Append to the cohort activity feed ("the pulse"). Never throws. */
export async function recordEvent(e: NewEvent): Promise<void> {
  try {
    await db.insert(events).values({
      type: e.type,
      summary: e.summary,
      actorId: e.actorId ?? null,
      actorName: e.actorName ?? null,
      targetType: e.targetType ?? null,
      targetId: e.targetId ?? null,
      weekId: e.weekId ?? null,
      meta: e.meta ?? null,
    });
    // Single chokepoint for the activity feed: every event writer routes through
    // here, so one invalidation keeps the cached pulse instantly fresh. expire:0
    // forces the next read to refetch (read-your-own-writes, no stale window).
    revalidateTag("events", { expire: 0 });
  } catch (err) {
    console.error("[events] failed to record", e.type, err);
  }
}

// Cached ~30s: the pulse only feeds overview surfaces (landing, /discover). A
// short TTL keeps it feeling live while collapsing repeated full-feed reads.
const _listEvents = unstable_cache(
  async (limit: number): Promise<Event[]> =>
    db.select().from(events).orderBy(desc(events.createdAt)).limit(limit),
  ["list-events"],
  { tags: ["events"], revalidate: 30 },
);
export async function listEvents(limit = 40): Promise<Event[]> {
  return _listEvents(limit);
}
