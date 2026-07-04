import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, asc, desc, eq, inArray, isNotNull, lte, ne, sql } from "drizzle-orm";
import { db } from "@portal/db";
import {
  users,
  profiles,
  weeks,
  assignments,
  submissions,
  feedback,
  reviewAssignments,
  comments,
  starGrants,
  githubSnapshots,
  follows,
  checkins,
  weekStepCompletions,
  resources,
  announcements,
  gitwitReviews,
} from "@portal/db/schema";
import { applicationCountryCounts } from "@portal/lib/applications";
import { normalizeCountry, displayCountry } from "@portal/lib/countries";
import { profileHref } from "@portal/lib/profileHref";
import type {
  Week,
  Assignment,
  Submission,
  Profile,
  Feedback,
  Comment,
  GitwitReviewRow,
} from "@portal/db/schema";
import type { CriterionVerdict } from "@portal/lib/gitwitTypes";

export type Author = {
  userId: string;
  name: string;
  login: string | null;
  avatarUrl: string | null;
  profileId: string | null;
  country: string | null;
};

export async function getAuthors(
  userIds: string[],
): Promise<Map<string, Author>> {
  const ids = [...new Set(userIds.filter(Boolean))];
  const map = new Map<string, Author>();
  if (!ids.length) return map;
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      login: users.githubLogin,
      avatarUrl: users.avatarUrl,
      profileId: profiles.id,
      displayName: profiles.displayName,
      country: profiles.country,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(inArray(users.id, ids));
  for (const r of rows) {
    map.set(r.userId, {
      userId: r.userId,
      name: r.displayName || r.name || r.login || "Participant",
      login: r.login,
      avatarUrl: r.avatarUrl,
      profileId: r.profileId,
      country: r.country,
    });
  }
  return map;
}

/* ---- Weeks --------------------------------------------------------------- */
// Weeks are global cohort data that changes only on admin actions, so they go
// behind a tagged cache: reads serve from cache, and every week mutation calls
// revalidateTag("weeks", { expire: 0 }) for instant freshness. The revalidate
// values are background safety nets, not the freshness mechanism.
const _listWeeks = unstable_cache(
  async (): Promise<Week[]> => db.select().from(weeks).orderBy(weeks.number),
  ["list-weeks"],
  { tags: ["weeks"], revalidate: 300 },
);
export async function listWeeks(): Promise<Week[]> {
  return _listWeeks();
}
const _getWeek = unstable_cache(
  async (id: string): Promise<Week | null> => {
    const [w] = await db.select().from(weeks).where(eq(weeks.id, id)).limit(1);
    return w ?? null;
  },
  ["get-week"],
  { tags: ["weeks"], revalidate: 300 },
);
export async function getWeek(id: string): Promise<Week | null> {
  return _getWeek(id);
}
const _getWeekByNumber = unstable_cache(
  async (number: number): Promise<Week | null> => {
    const [w] = await db.select().from(weeks).where(eq(weeks.number, number)).limit(1);
    return w ?? null;
  },
  ["get-week-by-number"],
  { tags: ["weeks"], revalidate: 300 },
);
export async function getWeekByNumber(number: number): Promise<Week | null> {
  return _getWeekByNumber(number);
}
// Shorter safety-net TTL than the other week reads: getCurrentWeek also rolls
// over by wall-clock (a week whose startsAt has passed), so cap the lag if no
// explicit admin action (setWeekLive) fires the tag first.
const _getCurrentWeek = unstable_cache(
  async (): Promise<Week | null> => {
    // 1) a week explicitly set live wins.
    const [live] = await db
      .select()
      .from(weeks)
      .where(eq(weeks.isLive, true))
      .limit(1);
    if (live) return live;

    // 2) the most recently *started* published week.
    const now = new Date();
    const [started] = await db
      .select()
      .from(weeks)
      .where(
        and(
          eq(weeks.isPublished, true),
          isNotNull(weeks.startsAt),
          lte(weeks.startsAt, now),
        ),
      )
      .orderBy(desc(weeks.number))
      .limit(1);
    if (started) return started;

    // 3) fall back to the first published week (program start).
    const [first] = await db
      .select()
      .from(weeks)
      .where(eq(weeks.isPublished, true))
      .orderBy(asc(weeks.number))
      .limit(1);
    return first ?? null;
  },
  ["get-current-week"],
  { tags: ["weeks"], revalidate: 60 },
);
export async function getCurrentWeek(): Promise<Week | null> {
  return _getCurrentWeek();
}

/* ---- Assignments --------------------------------------------------------- */
export async function getAssignment(id: string): Promise<Assignment | null> {
  const [a] = await db
    .select()
    .from(assignments)
    .where(eq(assignments.id, id))
    .limit(1);
  return a ?? null;
}
export async function listAssignmentsForWeek(
  weekId: string,
): Promise<Assignment[]> {
  return db
    .select()
    .from(assignments)
    .where(eq(assignments.weekId, weekId))
    .orderBy(assignments.createdAt);
}
/** The week's primary assignment — the first one posted for that week. */
export async function getAssignmentForWeekNumber(
  weekNumber: number,
): Promise<(Assignment & { week: Week }) | null> {
  const week = await getWeekByNumber(weekNumber);
  if (!week) return null;
  const [assignment] = await listAssignmentsForWeek(week.id);
  if (!assignment) return null;
  return { ...assignment, week };
}
export async function listAllAssignments(): Promise<
  (Assignment & { weekNumber: number; weekTheme: string })[]
> {
  const rows = await db
    .select({
      a: assignments,
      weekNumber: weeks.number,
      weekTheme: weeks.theme,
    })
    .from(assignments)
    .leftJoin(weeks, eq(weeks.id, assignments.weekId))
    .orderBy(desc(assignments.createdAt));
  return rows.map((r) => ({
    ...r.a,
    weekNumber: r.weekNumber ?? 0,
    weekTheme: r.weekTheme ?? "",
  }));
}

/* ---- Submissions --------------------------------------------------------- */
export type ShowcaseItem = {
  submission: Submission;
  author: Author;
  assignmentTitle: string;
  weekNumber: number;
  /** The submission's week id — used to deep-link back into its edit form. */
  weekId: string | null;
  feedbackCount: number;
  commentCount: number;
  /** GitHub stars on this submission's repo — the feed's "likes". */
  starCount: number;
};

async function decorateSubmissions(
  subs: Submission[],
): Promise<ShowcaseItem[]> {
  if (!subs.length) return [];
  const ids = subs.map((s) => s.id);
  const authors = await getAuthors(subs.map((s) => s.userId));

  const assignmentRows = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      weekNumber: weeks.number,
      weekId: assignments.weekId,
    })
    .from(assignments)
    .leftJoin(weeks, eq(weeks.id, assignments.weekId))
    .where(
      inArray(
        assignments.id,
        [...new Set(subs.map((s) => s.assignmentId))],
      ),
    );
  const aMap = new Map(assignmentRows.map((a) => [a.id, a]));

  const fbCounts = await db
    .select({
      submissionId: feedback.submissionId,
      n: sql<number>`count(*)::int`,
    })
    .from(feedback)
    .where(inArray(feedback.submissionId, ids))
    .groupBy(feedback.submissionId);
  const fbMap = new Map(fbCounts.map((c) => [c.submissionId, c.n]));

  const cmCounts = await db
    .select({
      targetId: comments.targetId,
      n: sql<number>`count(*)::int`,
    })
    .from(comments)
    .where(
      and(eq(comments.targetType, "submission"), inArray(comments.targetId, ids)),
    )
    .groupBy(comments.targetId);
  const cmMap = new Map(cmCounts.map((c) => [c.targetId, c.n]));

  // Stars on each submission's repo — the feed's "likes". Stars live per repo
  // (ss_star_grants), so we count successful grants keyed by owner/name.
  const repoNames = [
    ...new Set(
      subs.map((s) => s.repoName).filter((n): n is string => Boolean(n)),
    ),
  ];
  const starRows = repoNames.length
    ? await db
        .select({
          repoOwner: starGrants.repoOwner,
          repoName: starGrants.repoName,
          n: sql<number>`count(*)::int`,
        })
        .from(starGrants)
        .where(
          and(
            eq(starGrants.kind, "star"),
            eq(starGrants.ok, true),
            inArray(starGrants.repoName, repoNames),
          ),
        )
        .groupBy(starGrants.repoOwner, starGrants.repoName)
    : [];
  const starMap = new Map(
    starRows.map((r) => [`${r.repoOwner}/${r.repoName}`, r.n]),
  );

  return subs.map((s) => ({
    submission: s,
    author:
      authors.get(s.userId) ??
      {
        userId: s.userId,
        name: "Participant",
        login: null,
        avatarUrl: null,
        profileId: null,
        country: null,
      },
    assignmentTitle: aMap.get(s.assignmentId)?.title ?? "Assignment",
    weekNumber: aMap.get(s.assignmentId)?.weekNumber ?? 0,
    weekId: aMap.get(s.assignmentId)?.weekId ?? null,
    feedbackCount: fbMap.get(s.id) ?? 0,
    commentCount: cmMap.get(s.id) ?? 0,
    starCount:
      s.repoOwner && s.repoName
        ? starMap.get(`${s.repoOwner}/${s.repoName}`) ?? 0
        : 0,
  }));
}

/**
 * Top comments per submission for the showcase feed — newest first, capped at
 * `perPost`. The full count already rides on ShowcaseItem, so this is just the
 * preview shown inline under each post (the rest live on the submission page).
 */
export async function listTopCommentsForSubmissions(
  submissionIds: string[],
  perPost = 2,
): Promise<Map<string, (Comment & { author: Author })[]>> {
  const map = new Map<string, (Comment & { author: Author })[]>();
  if (!submissionIds.length) return map;
  const rows = await db
    .select()
    .from(comments)
    .where(
      and(
        eq(comments.targetType, "submission"),
        inArray(comments.targetId, submissionIds),
      ),
    )
    .orderBy(desc(comments.createdAt));
  const authors = await getAuthors(rows.map((r) => r.userId));
  for (const r of rows) {
    const arr = map.get(r.targetId) ?? [];
    if (arr.length < perPost) {
      arr.push({ ...r, author: authors.get(r.userId)! });
      map.set(r.targetId, arr);
    }
  }
  return map;
}

// Cached: the showcase only feeds overview surfaces (landing, /discover,
// /demo-day), so a short TTL is fine and saves a full submissions scan per hit.
const _listShowcase = unstable_cache(
  async (opts?: { weekId?: string; limit?: number }): Promise<ShowcaseItem[]> => {
    let subs: Submission[];
    if (opts?.weekId) {
      const weekAssignments = await db
        .select({ id: assignments.id })
        .from(assignments)
        .where(eq(assignments.weekId, opts.weekId));
      const ids = weekAssignments.map((a) => a.id);
      if (!ids.length) return [];
      subs = await db
        .select()
        .from(submissions)
        .where(inArray(submissions.assignmentId, ids))
        .orderBy(desc(submissions.createdAt))
        .limit(opts?.limit ?? 200);
    } else {
      subs = await db
        .select()
        .from(submissions)
        .orderBy(desc(submissions.createdAt))
        .limit(opts?.limit ?? 200);
    }
    return decorateSubmissions(subs);
  },
  ["list-showcase"],
  { tags: ["showcase"], revalidate: 60 },
);
export async function listShowcase(opts?: {
  weekId?: string;
  limit?: number;
}): Promise<ShowcaseItem[]> {
  return _listShowcase(opts);
}

export async function listSubmissionsForAssignment(
  assignmentId: string,
  opts?: { excludeUserId?: string },
): Promise<ShowcaseItem[]> {
  const where = opts?.excludeUserId
    ? and(
        eq(submissions.assignmentId, assignmentId),
        ne(submissions.userId, opts.excludeUserId),
      )
    : eq(submissions.assignmentId, assignmentId);
  const subs = await db
    .select()
    .from(submissions)
    .where(where)
    .orderBy(desc(submissions.createdAt));
  return decorateSubmissions(subs);
}

export async function listSubmissionsByUser(
  userId: string,
): Promise<ShowcaseItem[]> {
  const subs = await db
    .select()
    .from(submissions)
    .where(eq(submissions.userId, userId))
    .orderBy(desc(submissions.createdAt));
  return decorateSubmissions(subs);
}

export async function getSubmissionDetail(id: string): Promise<{
  submission: Submission;
  author: Author;
  assignment: Assignment | null;
  week: Week | null;
  /** GitHub stars on this submission's repo — the feed's "likes". */
  starCount: number;
} | null> {
  const [s] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);
  if (!s) return null;
  const authors = await getAuthors([s.userId]);
  const assignment = await getAssignment(s.assignmentId);
  const week = assignment ? await getWeek(assignment.weekId) : null;

  let starCount = 0;
  if (s.repoOwner && s.repoName) {
    const [row] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(starGrants)
      .where(
        and(
          eq(starGrants.kind, "star"),
          eq(starGrants.ok, true),
          eq(starGrants.repoOwner, s.repoOwner),
          eq(starGrants.repoName, s.repoName),
        ),
      );
    starCount = row?.n ?? 0;
  }

  return {
    submission: s,
    author: authors.get(s.userId)!,
    assignment,
    week,
    starCount,
  };
}

export async function getUserSubmissionForAssignment(
  assignmentId: string,
  userId: string,
): Promise<Submission | null> {
  const [s] = await db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.assignmentId, assignmentId),
        eq(submissions.userId, userId),
      ),
    )
    .orderBy(desc(submissions.createdAt))
    .limit(1);
  return s ?? null;
}

/* ---- GitWit review cache ------------------------------------------------- */

/** The user's most recent cached GitWit review, or null if never run. */
export async function getCachedGitwitReview(
  userId: string,
): Promise<GitwitReviewRow | null> {
  const [row] = await db
    .select()
    .from(gitwitReviews)
    .where(eq(gitwitReviews.userId, userId))
    .limit(1);
  return row ?? null;
}

/** Insert or overwrite the user's cached GitWit review (one row per user). */
export async function upsertGitwitReview(
  userId: string,
  login: string,
  verdicts: CriterionVerdict[],
): Promise<GitwitReviewRow> {
  const [row] = await db
    .insert(gitwitReviews)
    .values({ userId, login, verdicts })
    .onConflictDoUpdate({
      target: gitwitReviews.userId,
      set: { login, verdicts, updatedAt: new Date() },
    })
    .returning();
  return row;
}

const _countSubmissions = unstable_cache(
  async (): Promise<number> => {
    const [r] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(submissions);
    return r?.n ?? 0;
  },
  ["count-submissions"],
  { tags: ["showcase"], revalidate: 300 },
);
export async function countSubmissions(): Promise<number> {
  return _countSubmissions();
}

/* ---- Feedback ------------------------------------------------------------ */
export async function listFeedbackForSubmission(
  submissionId: string,
): Promise<(Feedback & { author: Author })[]> {
  const rows = await db
    .select()
    .from(feedback)
    .where(eq(feedback.submissionId, submissionId))
    .orderBy(desc(feedback.createdAt));
  const authors = await getAuthors(rows.map((r) => r.reviewerId));
  return rows.map((r) => ({
    ...r,
    author: authors.get(r.reviewerId)!,
  }));
}

export type PendingReview = {
  reviewAssignmentId: string;
  submission: Submission;
  author: Author;
  assignmentTitle: string;
};

export async function listPendingReviews(
  userId: string,
): Promise<PendingReview[]> {
  const rows = await db
    .select({
      raId: reviewAssignments.id,
      submission: submissions,
      assignmentTitle: assignments.title,
    })
    .from(reviewAssignments)
    .innerJoin(submissions, eq(submissions.id, reviewAssignments.submissionId))
    .leftJoin(assignments, eq(assignments.id, reviewAssignments.assignmentId))
    .where(
      and(
        eq(reviewAssignments.reviewerId, userId),
        eq(reviewAssignments.completed, false),
      ),
    )
    .orderBy(desc(reviewAssignments.createdAt));
  const authors = await getAuthors(rows.map((r) => r.submission.userId));
  return rows.map((r) => ({
    reviewAssignmentId: r.raId,
    submission: r.submission,
    author: authors.get(r.submission.userId)!,
    assignmentTitle: r.assignmentTitle ?? "Assignment",
  }));
}

export async function countFeedbackGiven(userId: string): Promise<number> {
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(feedback)
    .where(eq(feedback.reviewerId, userId));
  return r?.n ?? 0;
}

/* ---- Comments ------------------------------------------------------------ */
export async function listComments(
  targetType: "submission" | "profile" | "announcement",
  targetId: string,
): Promise<(Comment & { author: Author })[]> {
  const rows = await db
    .select()
    .from(comments)
    .where(and(eq(comments.targetType, targetType), eq(comments.targetId, targetId)))
    .orderBy(desc(comments.createdAt));
  const authors = await getAuthors(rows.map((r) => r.userId));
  return rows.map((r) => ({ ...r, author: authors.get(r.userId)! }));
}

/* ---- Profiles / directory ------------------------------------------------ */
export async function getProfileByUserId(
  userId: string,
): Promise<Profile | null> {
  const [p] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return p ?? null;
}

export async function getProfilePage(profileId: string): Promise<{
  profile: Profile;
  author: Author;
} | null> {
  const [p] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);
  if (!p) return null;
  const authors = await getAuthors([p.userId]);
  return { profile: p, author: authors.get(p.userId)! };
}

/** Resolve a profile by GitHub login (case-insensitive) for /users/[login]. */
export async function getProfileByGithubLogin(login: string): Promise<{
  profile: Profile;
  author: Author;
} | null> {
  const [u] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.githubLogin}) = ${login.toLowerCase()}`)
    .limit(1);
  if (!u) return null;
  const [p] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, u.id))
    .limit(1);
  if (!p) return null;
  const authors = await getAuthors([u.id]);
  return { profile: p, author: authors.get(u.id)! };
}

/** The GitHub login that owns a profile, if any — used to canonicalize links. */
export async function getLoginForProfileId(
  profileId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ login: users.githubLogin })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .where(eq(profiles.id, profileId))
    .limit(1);
  return row?.login ?? null;
}

/** Whether `fromUserId` currently follows `toUserId` (manual GitHub follow). */
export async function isViewerFollowing(
  fromUserId: string,
  toUserId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ active: follows.active })
    .from(follows)
    .where(
      and(eq(follows.fromUserId, fromUserId), eq(follows.toUserId, toUserId)),
    )
    .limit(1);
  return Boolean(row?.active);
}

/** How many people this user actively follows (drives the "follow peers" step). */
export async function countActiveFollows(userId: string): Promise<number> {
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(follows)
    .where(and(eq(follows.fromUserId, userId), eq(follows.active, true)));
  return r?.n ?? 0;
}

/** How many profile comments this user has left (drives the "review profiles" step). */
export async function countProfileCommentsBy(userId: string): Promise<number> {
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(comments)
    .where(and(eq(comments.userId, userId), eq(comments.targetType, "profile")));
  return r?.n ?? 0;
}

export type DirectoryEntry = {
  profile: Profile;
  author: Author;
  starsReceived: number;
  /** Profile comments left by peers — these double as Week 1 compliments. */
  complimentCount: number;
};

// The cohort directory is global/public and feeds the heaviest scroll surfaces
// (/discover people, /demo-day, /admin/people). Tagged on BOTH profiles and
// stars since rows carry starsReceived; either kind of write busts it instantly.
const _listProfiles = unstable_cache(
  async (): Promise<DirectoryEntry[]> => {
    const rows = await db
      .select({
        profile: profiles,
        name: users.name,
        login: users.githubLogin,
        avatarUrl: users.avatarUrl,
      })
      .from(profiles)
      .leftJoin(users, eq(users.id, profiles.userId))
      .orderBy(desc(profiles.createdAt));
    const stars = await starLeaderboardMap();
    const profileIds = rows.map((r) => r.profile.id);
    const cmCounts = profileIds.length
      ? await db
          .select({
            targetId: comments.targetId,
            n: sql<number>`count(*)::int`,
          })
          .from(comments)
          .where(
            and(
              eq(comments.targetType, "profile"),
              inArray(comments.targetId, profileIds),
            ),
          )
          .groupBy(comments.targetId)
      : [];
    const cmMap = new Map(cmCounts.map((c) => [c.targetId, c.n]));
    return rows.map((r) => ({
      profile: r.profile,
      author: {
        userId: r.profile.userId,
        name: r.profile.displayName || r.name || r.login || "Participant",
        login: r.login ?? null,
        avatarUrl: r.avatarUrl ?? null,
        profileId: r.profile.id,
        country: r.profile.country,
      },
      starsReceived: stars.get(r.profile.userId) ?? 0,
      complimentCount: cmMap.get(r.profile.id) ?? 0,
    }));
  },
  ["list-profiles"],
  { tags: ["profiles", "stars"], revalidate: 300 },
);
export async function listProfiles(): Promise<DirectoryEntry[]> {
  return _listProfiles();
}

const _countParticipants = unstable_cache(
  async (): Promise<number> => {
    const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(profiles);
    return r?.n ?? 0;
  },
  ["count-participants"],
  { tags: ["profiles"], revalidate: 300 },
);
export async function countParticipants(): Promise<number> {
  return _countParticipants();
}

/**
 * Repos the user has already starred — these are their feed "likes" (keys are
 * `owner/name`). Per-user, so it's read fresh each request (not cached).
 */
export async function listStarredRepoKeys(userId: string): Promise<Set<string>> {
  const rows = await db
    .select({ repoOwner: starGrants.repoOwner, repoName: starGrants.repoName })
    .from(starGrants)
    .where(
      and(
        eq(starGrants.fromUserId, userId),
        eq(starGrants.kind, "star"),
        eq(starGrants.ok, true),
      ),
    );
  const set = new Set<string>();
  for (const r of rows) {
    if (r.repoOwner && r.repoName) set.add(`${r.repoOwner}/${r.repoName}`);
  }
  return set;
}

export type MentionPerson = {
  username: string;
  name: string | null;
  avatarUrl: string | null;
};

/** People who can be @mentioned — anyone with a public @handle (username). */
export async function listMentionablePeople(): Promise<MentionPerson[]> {
  const rows = await db
    .select({
      username: profiles.username,
      displayName: profiles.displayName,
      name: users.name,
      avatarUrl: users.avatarUrl,
    })
    .from(profiles)
    .leftJoin(users, eq(users.id, profiles.userId))
    .where(isNotNull(profiles.username))
    .orderBy(asc(profiles.displayName));
  return rows.map((r) => ({
    username: r.username as string,
    name: r.displayName || r.name || (r.username as string),
    avatarUrl: r.avatarUrl ?? null,
  }));
}

/* ---- Stars / glow-up ----------------------------------------------------- */
// Returns a Map (not JSON-serializable), so this uses React cache() for
// per-request dedup only — its two callers (listProfiles, starLeaderboard) are
// the ones behind the cross-request "stars"-tagged cache.
export const starLeaderboardMap = cache(
  async (): Promise<Map<string, number>> => {
    const rows = await db
      .select({
        toUserId: starGrants.toUserId,
        n: sql<number>`count(*)::int`,
      })
      .from(starGrants)
      .where(and(eq(starGrants.kind, "star"), eq(starGrants.ok, true)))
      .groupBy(starGrants.toUserId);
    return new Map(rows.map((r) => [r.toUserId, r.n]));
  },
);

export type StarBoardRow = { author: Author; stars: number };

const _starLeaderboard = unstable_cache(
  async (): Promise<{ total: number; rows: StarBoardRow[] }> => {
    const map = await starLeaderboardMap();
    const authors = await getAuthors([...map.keys()]);
    const rows = [...map.entries()]
      .map(([userId, stars]) => ({
        author:
          authors.get(userId) ??
          {
            userId,
            name: "Participant",
            login: null,
            avatarUrl: null,
            profileId: null,
            country: null,
          },
        stars,
      }))
      .sort((a, b) => b.stars - a.stars);
    const total = rows.reduce((s, r) => s + r.stars, 0);
    return { total, rows };
  },
  ["star-leaderboard"],
  { tags: ["stars"], revalidate: 120 },
);
export async function starLeaderboard(): Promise<{
  total: number;
  rows: StarBoardRow[];
}> {
  return _starLeaderboard();
}

export type GlowUp = {
  author: Author;
  intake: { totalStars: number; followers: number; publicRepos: number } | null;
  latest: { totalStars: number; followers: number; publicRepos: number } | null;
};

export async function getGlowUp(userId: string): Promise<GlowUp | null> {
  const rows = await db
    .select()
    .from(githubSnapshots)
    .where(eq(githubSnapshots.userId, userId));
  if (!rows.length) return null;
  const authors = await getAuthors([userId]);
  const intake = rows.find((r) => r.phase === "intake") ?? null;
  const latest = rows.find((r) => r.phase === "latest") ?? null;
  return {
    author: authors.get(userId)!,
    intake: intake
      ? {
          totalStars: intake.totalStars,
          followers: intake.followers,
          publicRepos: intake.publicRepos,
        }
      : null,
    latest: latest
      ? {
          totalStars: latest.totalStars,
          followers: latest.followers,
          publicRepos: latest.publicRepos,
        }
      : null,
  };
}

/* ---- Streaks / check-ins ------------------------------------------------- */
export async function getStreak(userId: string): Promise<{
  current: number;
  total: number;
  checkedInToday: boolean;
}> {
  const rows = await db
    .select({ day: checkins.day })
    .from(checkins)
    .where(eq(checkins.userId, userId))
    .orderBy(desc(checkins.day));
  const days = rows.map((r) => String(r.day));
  const set = new Set(days);

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const checkedInToday = set.has(todayStr);

  let current = 0;
  const cursor = new Date();
  if (!checkedInToday && !set.has(yesterday)) {
    current = 0;
  } else {
    if (!checkedInToday) cursor.setDate(cursor.getDate() - 1);
    while (set.has(cursor.toISOString().slice(0, 10))) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }
  return { current, total: days.length, checkedInToday };
}

/* ---- Week step checklist (manual todo toggles) --------------------------- */
export async function getWeekStepCompletions(
  userId: string,
  weekId: string,
): Promise<Map<string, boolean>> {
  const rows = await db
    .select({
      stepKey: weekStepCompletions.stepKey,
      completed: weekStepCompletions.completed,
    })
    .from(weekStepCompletions)
    .where(
      and(
        eq(weekStepCompletions.userId, userId),
        eq(weekStepCompletions.weekId, weekId),
      ),
    );
  return new Map(rows.map((r) => [r.stepKey, r.completed]));
}

/* ---- Announcements ------------------------------------------------------- */
export async function listAnnouncements(limit = 20) {
  return db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.pinned), desc(announcements.createdAt))
    .limit(limit);
}

export async function getAnnouncement(id: string) {
  const [row] = await db
    .select()
    .from(announcements)
    .where(eq(announcements.id, id))
    .limit(1);
  return row ?? null;
}

/** Resolve @handles to real profiles (for mention links + notifications). */
export async function resolveMentions(
  handles: string[],
): Promise<{ username: string; userId: string; email: string | null }[]> {
  const clean = [...new Set(handles.map((h) => h.toLowerCase()))].filter(Boolean);
  if (!clean.length) return [];
  const rows = await db
    .select({
      username: profiles.username,
      userId: profiles.userId,
      email: users.email,
    })
    .from(profiles)
    .leftJoin(users, eq(users.id, profiles.userId))
    .where(inArray(profiles.username, clean));
  return rows
    .filter((r): r is { username: string; userId: string; email: string | null } =>
      Boolean(r.username),
    );
}

/* ---- Resources ----------------------------------------------------------- */
export async function listResourcesForWeek(weekId: string) {
  return db
    .select()
    .from(resources)
    .where(eq(resources.weekId, weekId))
    .orderBy(desc(resources.createdAt));
}

/* ---- Map ----------------------------------------------------------------- */
/**
 * Locations come from the existing applicant data in Neon (hh_applications →
 * answers->>'q1'), normalized. This is the comprehensive country dataset we
 * already have, so the map shows real global reach from day one.
 */
export async function participantLocations(): Promise<
  { country: string; count: number }[]
> {
  return applicationCountryCounts();
}

export type MapProfile = {
  profileId: string;
  displayName: string;
  avatarUrl: string | null;
  city: string | null;
  countryKey: string;
  countryDisplay: string;
  href: string;
};

const _listProfilesForMap = unstable_cache(
  async (): Promise<MapProfile[]> => {
    const rows = await db
      .select({
        profile: profiles,
        name: users.name,
        login: users.githubLogin,
        avatarUrl: users.avatarUrl,
      })
      .from(profiles)
      .leftJoin(users, eq(users.id, profiles.userId))
      .orderBy(desc(profiles.createdAt));

    const result: MapProfile[] = [];
    for (const r of rows) {
      const key = normalizeCountry(r.profile.country);
      if (!key) continue;
      result.push({
        profileId: r.profile.id,
        displayName:
          r.profile.displayName || r.name || r.login || "Participant",
        avatarUrl: r.avatarUrl ?? null,
        city: r.profile.city ?? null,
        countryKey: key,
        countryDisplay: displayCountry(key),
        href: profileHref({ login: r.login, profileId: r.profile.id }),
      });
    }
    return result;
  },
  ["list-profiles-for-map"],
  { tags: ["profiles"], revalidate: 300 },
);

export async function listProfilesForMap(): Promise<MapProfile[]> {
  return _listProfilesForMap();
}
