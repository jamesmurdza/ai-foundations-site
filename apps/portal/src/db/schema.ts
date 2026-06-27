import {
  pgTable,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  date,
  uniqueIndex,
  index,
  customType,
} from "drizzle-orm/pg-core";

/** Raw binary column. node-postgres maps `bytea` <-> Node Buffer. */
export const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
  toDriver(value: Buffer): Buffer {
    return value;
  },
  fromDriver(value: unknown): Buffer {
    return value as Buffer;
  },
});

const id = (name = "id") =>
  text(name)
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = timestamp("created_at", { withTimezone: true })
  .defaultNow()
  .notNull();

/* ---------------------------------------------------------------------------
   Identity & profile
--------------------------------------------------------------------------- */
export const users = pgTable(
  "ss_users",
  {
    id: id(),
    githubId: text("github_id"),
    githubLogin: text("github_login"),
    email: text("email"),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    accessToken: text("access_token"),
    tokenScopes: text("token_scopes"),
    isAdmin: boolean("is_admin").default(false).notNull(),
    isDev: boolean("is_dev").default(false).notNull(),
    applicationId: text("application_id"),
    createdAt,
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("ss_users_github_id_idx").on(t.githubId),
    index("ss_users_email_idx").on(t.email),
  ],
);

export const profiles = pgTable(
  "ss_profiles",
  {
    id: id(),
    userId: text("user_id").notNull(),
    username: text("username"), // unique @handle for shareable /u/[username] URLs
    displayName: text("display_name"),
    proudOf: text("proud_of"),
    wantToAchieve: text("want_to_achieve"),
    achieved: boolean("achieved").default(false).notNull(),
    achievedAt: timestamp("achieved_at", { withTimezone: true }),
    bio: text("bio"),
    githubUrl: text("github_url"),
    linkedinUrl: text("linkedin_url"),
    xUrl: text("x_url"),
    siteUrl: text("site_url"),
    portfolioUrl: text("portfolio_url"),
    otherUrl: text("other_url"),
    country: text("country"),
    city: text("city"),
    publicEmail: text("public_email"),
    // Global opt-in: when on, the user's submitted repos get auto-starred by the
    // cohort and they auto-star others. Replaces the old per-submission toggle.
    tradeStarsEnabled: boolean("trade_stars_enabled").default(false).notNull(),
    graduate: boolean("graduate").default(false).notNull(),
    createdAt,
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("ss_profiles_user_idx").on(t.userId),
    uniqueIndex("ss_profiles_username_idx").on(t.username),
  ],
);

/* ---------------------------------------------------------------------------
   Program spine
--------------------------------------------------------------------------- */
export const weeks = pgTable(
  "ss_weeks",
  {
    id: id(),
    number: integer("number").notNull(),
    theme: text("theme").notNull(),
    description: text("description"),
    streamUrl: text("stream_url"),
    recordingUrl: text("recording_url"),
    isLive: boolean("is_live").default(false).notNull(),
    isPublished: boolean("is_published").default(true).notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    createdAt,
  },
  (t) => [uniqueIndex("ss_weeks_number_idx").on(t.number)],
);

export const assignments = pgTable("ss_assignments", {
  id: id(),
  weekId: text("week_id").notNull(),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  submissionType: text("submission_type").notNull(), // link | repo | file | text | any
  deadline: timestamp("deadline", { withTimezone: true }),
  recurring: boolean("recurring").default(false).notNull(),
  reviewCount: integer("review_count").default(3).notNull(),
  createdBy: text("created_by"),
  createdAt,
});

export const submissions = pgTable(
  "ss_submissions",
  {
    id: id(),
    assignmentId: text("assignment_id").notNull(),
    userId: text("user_id").notNull(),
    title: text("title"),
    payload: text("payload").notNull(),
    payloadType: text("payload_type").notNull(), // link | repo | file | text
    notes: text("notes"),
    tradeStars: boolean("trade_stars").default(false).notNull(),
    repoOwner: text("repo_owner"),
    repoName: text("repo_name"),
    createdAt,
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("ss_submissions_assignment_idx").on(t.assignmentId),
    index("ss_submissions_user_idx").on(t.userId),
    // One submission per assignment per user — resubmitting edits it in place.
    uniqueIndex("ss_submissions_assignment_user_idx").on(t.assignmentId, t.userId),
  ],
);

/* ---------------------------------------------------------------------------
   Peer feedback (random matching)
--------------------------------------------------------------------------- */
export const reviewAssignments = pgTable(
  "ss_review_assignments",
  {
    id: id(),
    assignmentId: text("assignment_id").notNull(),
    reviewerId: text("reviewer_id").notNull(),
    submissionId: text("submission_id").notNull(),
    completed: boolean("completed").default(false).notNull(),
    createdAt,
  },
  (t) => [
    uniqueIndex("ss_review_unique_idx").on(t.reviewerId, t.submissionId),
    index("ss_review_reviewer_idx").on(t.reviewerId),
  ],
);

export const feedback = pgTable(
  "ss_feedback",
  {
    id: id(),
    submissionId: text("submission_id").notNull(),
    reviewerId: text("reviewer_id").notNull(),
    body: text("body").notNull(),
    rating: integer("rating"),
    assigned: boolean("assigned").default(false).notNull(),
    createdAt,
  },
  (t) => [index("ss_feedback_submission_idx").on(t.submissionId)],
);

/* ---------------------------------------------------------------------------
   Comments (on submissions & profiles)
--------------------------------------------------------------------------- */
export const comments = pgTable(
  "ss_comments",
  {
    id: id(),
    targetType: text("target_type").notNull(), // submission | profile
    targetId: text("target_id").notNull(),
    userId: text("user_id").notNull(),
    body: text("body").notNull(),
    createdAt,
  },
  (t) => [index("ss_comments_target_idx").on(t.targetType, t.targetId)],
);

/* ---------------------------------------------------------------------------
   Trade Stars + GitHub
--------------------------------------------------------------------------- */
export const starTrades = pgTable(
  "ss_star_trades",
  {
    id: id(),
    userId: text("user_id").notNull(),
    submissionId: text("submission_id"),
    weekId: text("week_id"),
    repoOwner: text("repo_owner"),
    repoName: text("repo_name"),
    githubLogin: text("github_login"),
    optedIn: boolean("opted_in").default(true).notNull(),
    createdAt,
  },
  (t) => [uniqueIndex("ss_star_trades_user_week_idx").on(t.userId, t.weekId)],
);

export const starGrants = pgTable(
  "ss_star_grants",
  {
    id: id(),
    weekId: text("week_id"),
    fromUserId: text("from_user_id").notNull(),
    toUserId: text("to_user_id").notNull(),
    kind: text("kind").notNull(), // star | follow
    repoOwner: text("repo_owner"),
    repoName: text("repo_name"),
    ok: boolean("ok").default(false).notNull(),
    error: text("error"), // failure reason; sentinels: "manual_unstar", "permanent"
    // Reconciler job-state: retry budget + when this pair is next eligible to be
    // attempted (null = ready now). Lets the throttled reconciler back off and
    // park dead repos instead of re-hitting them every run.
    attempts: integer("attempts").default(0).notNull(),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    createdAt,
  },
  (t) => [
    // Stars are deduped per (actor, repo) — no week scoping. Follow rows have
    // null repo cols and coexist (Postgres treats them as distinct); follows are
    // deduped in code.
    uniqueIndex("ss_star_grants_from_repo_idx").on(
      t.fromUserId,
      t.repoOwner,
      t.repoName,
    ),
  ],
);

/**
 * Manual GitHub follows. A participant clicks "Follow" on another's profile and
 * we follow them on GitHub for real. NOT auto-generated — there is no auto-follow
 * anywhere. `active=false` records an unfollow (kept for history / re-follow).
 */
export const follows = pgTable(
  "ss_follows",
  {
    id: id(),
    fromUserId: text("from_user_id").notNull(), // the viewer who clicked follow
    toUserId: text("to_user_id").notNull(), // the portal user being followed
    toLogin: text("to_login").notNull(), // GitHub login followed (denormalized)
    active: boolean("active").default(true).notNull(),
    createdAt,
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("ss_follows_from_to_idx").on(t.fromUserId, t.toUserId),
    index("ss_follows_to_idx").on(t.toUserId),
  ],
);

export const githubSnapshots = pgTable("ss_github_snapshots", {
  id: id(),
  userId: text("user_id").notNull(),
  phase: text("phase").notNull(), // intake | latest
  publicRepos: integer("public_repos").default(0).notNull(),
  followers: integer("followers").default(0).notNull(),
  following: integer("following").default(0).notNull(),
  totalStars: integer("total_stars").default(0).notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ---------------------------------------------------------------------------
   Engagement: events feed, check-ins, resources, stream interaction
--------------------------------------------------------------------------- */
export const events = pgTable(
  "ss_events",
  {
    id: id(),
    type: text("type").notNull(),
    actorId: text("actor_id"),
    actorName: text("actor_name"),
    summary: text("summary").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    weekId: text("week_id"),
    meta: jsonb("meta"),
    createdAt,
  },
  (t) => [index("ss_events_created_idx").on(t.createdAt)],
);

export const checkins = pgTable(
  "ss_checkins",
  {
    id: id(),
    userId: text("user_id").notNull(),
    weekId: text("week_id"),
    day: date("day").notNull(),
    createdAt,
  },
  (t) => [uniqueIndex("ss_checkins_user_day_idx").on(t.userId, t.day)],
);

/** Per-user manual completion toggles for the week checklist on /home. */
export const weekStepCompletions = pgTable(
  "ss_week_step_completions",
  {
    id: id(),
    userId: text("user_id").notNull(),
    weekId: text("week_id").notNull(),
    stepKey: text("step_key").notNull(),
    completed: boolean("completed").notNull(),
    createdAt,
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("ss_week_step_completions_user_week_step_idx").on(
      t.userId,
      t.weekId,
      t.stepKey,
    ),
  ],
);

export const resources = pgTable("ss_resources", {
  id: id(),
  weekId: text("week_id").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  kind: text("kind").default("link").notNull(),
  createdBy: text("created_by"),
  createdAt,
});

export const streamReactions = pgTable("ss_stream_reactions", {
  id: id(),
  weekId: text("week_id").notNull(),
  userId: text("user_id"),
  emoji: text("emoji").notNull(),
  createdAt,
});

export const qaQuestions = pgTable("ss_qa_questions", {
  id: id(),
  weekId: text("week_id").notNull(),
  userId: text("user_id"),
  userName: text("user_name"),
  body: text("body").notNull(),
  upvotes: integer("upvotes").default(0).notNull(),
  answered: boolean("answered").default(false).notNull(),
  createdAt,
});

export const qaUpvotes = pgTable(
  "ss_qa_upvotes",
  {
    id: id(),
    questionId: text("question_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt,
  },
  (t) => [uniqueIndex("ss_qa_upvotes_idx").on(t.questionId, t.userId)],
);

export const streamPresence = pgTable(
  "ss_stream_presence",
  {
    id: id(),
    weekId: text("week_id").notNull(),
    userId: text("user_id").notNull(),
    userName: text("user_name"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("ss_presence_idx").on(t.weekId, t.userId)],
);

/* ---------------------------------------------------------------------------
   Email deliverability log
--------------------------------------------------------------------------- */
export const emailLogs = pgTable(
  "ss_email_logs",
  {
    id: id(),
    userId: text("user_id"),
    toEmail: text("to_email").notNull(),
    type: text("type").notNull(),
    subject: text("subject").notNull(),
    status: text("status").notNull(), // sent | logged | failed
    providerId: text("provider_id"),
    error: text("error"),
    createdAt,
  },
  (t) => [index("ss_email_logs_type_idx").on(t.type)],
);

/* ---------------------------------------------------------------------------
   Admin allowlist (who can access the organizer console) + announcements
--------------------------------------------------------------------------- */
export const admins = pgTable(
  "ss_admins",
  {
    id: id(),
    email: text("email"),
    githubLogin: text("github_login"),
    name: text("name"),
    addedBy: text("added_by"),
    createdAt,
  },
  (t) => [
    uniqueIndex("ss_admins_email_idx").on(t.email),
    index("ss_admins_login_idx").on(t.githubLogin),
  ],
);

export const announcements = pgTable(
  "ss_announcements",
  {
    id: id(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    weekId: text("week_id"),
    pinned: boolean("pinned").default(false).notNull(),
    authorId: text("author_id"),
    authorName: text("author_name"),
    emailSent: boolean("email_sent").default(false).notNull(),
    createdAt,
  },
  (t) => [index("ss_announcements_created_idx").on(t.createdAt)],
);

/* ---------------------------------------------------------------------------
   Email sign-in codes (OTP) — students log in with their application email
--------------------------------------------------------------------------- */
export const loginCodes = pgTable(
  "ss_login_codes",
  {
    id: id(),
    email: text("email").notNull(),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumed: boolean("consumed").default(false).notNull(),
    attempts: integer("attempts").default(0).notNull(),
    createdAt,
  },
  (t) => [index("ss_login_codes_email_idx").on(t.email)],
);

/* ---------------------------------------------------------------------------
   Downloadable files + polymorphic attachments
   Admins attach docs to anything they post (announcements, assignments, weeks,
   resources); students attach files to submissions. Bytes live in ss_files;
   ss_attachments links a file to a target so one upload can be reused.
--------------------------------------------------------------------------- */
export const files = pgTable("ss_files", {
  id: id(),
  name: text("name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  // Either `data` (legacy: bytes in Postgres, <=4MB) OR `url`+`pathname` (Vercel
  // Blob, large files uploaded straight from the browser). Exactly one is set.
  data: bytea("data"),
  url: text("url"),
  pathname: text("pathname"),
  uploadedBy: text("uploaded_by"),
  createdAt,
});

export const attachments = pgTable(
  "ss_attachments",
  {
    id: id(),
    fileId: text("file_id").notNull(),
    // announcement | assignment | week | resource | submission | profile
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    label: text("label"),
    createdAt,
  },
  (t) => [index("ss_attachments_target_idx").on(t.targetType, t.targetId)],
);

export type User = typeof users.$inferSelect;
export type FileRow = typeof files.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Week = typeof weeks.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Follow = typeof follows.$inferSelect;
