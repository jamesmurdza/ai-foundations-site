# AI Foundations Summer School Portal (`ssportal`) — Architecture Guide

> Audience: an engineer brand new to this codebase. Every fact below was verified against the real source.

---

## 1. What this is

`ssportal` is a Next.js 16 (App Router) + React 19 web app for running the **AI Foundations Summer School** — a multi-week cohort program. Students sign in (GitHub OAuth or email one-time-code), complete onboarding, then live inside a weekly "check-in" experience: watch streams, do assignments, submit work, give/receive peer review, comment, react, and discover each other. The signature feature is **Trade Stars** — from Week 2 onward, opted-in members automatically star each other's GitHub portfolio repos, and the portal tracks each person's GitHub "glow-up" (followers/repos/stars delta) over the program. Organizers run everything from an `/admin` console: weeks, assignments, announcements, going live, peer-review matching, bulk email, and the organizer allowlist.

**Stack:** Next.js `16.2.7` (App Router, Server Components, Server Actions, the renamed **Proxy** middleware, `after()`), React `19.2.4`, Drizzle ORM `0.45.2` over Neon Postgres (`pg` Pool), `jose` JWT sessions, `nodemailer` SMTP (ImprovMX), Vercel Blob for large files, `d3-geo`/`topojson-client` for the world map, `sanitize-html` for README rendering, Tailwind v4. Deploy target is Vercel (Blob, `after()`, force-dynamic root layout all assume it). The app owns the **`ss_*`** table namespace and coexists with a **read-only `hh_*`** applicant archive (the HackerHouse applications DB) on the same Neon instance.

> **AGENTS.md warning** (repeated for emphasis): this Next.js version has breaking changes vs. typical training data — Middleware is renamed `proxy.ts` (verified), and behavior should be trusted from the code / `node_modules/next/dist/docs` over priors.

---

## 2. System diagram

```
                          ┌──────────────────────────────────────────────────────────┐
   Browser  ───request──▶ │  Next.js 16 PROXY (src/proxy.ts, Node runtime)            │
                          │  • reads ss_session cookie, verifies JWT (jose)          │
                          │  • if token >1 day old: re-signs, slides 30-day window   │
                          │  • NEVER blocks — invalid token passes through untouched  │
                          │  matcher: all routes EXCEPT /api, _next/static|image, ... │
                          └───────────────────────────┬──────────────────────────────┘
                                                       ▼
        ┌──────────────────────────────────────────────────────────────────────────┐
        │  ROUTE (App Router)                                                         │
        │   Server Component page  ──or──  Server Action ("use server")             │
        │                                                                            │
        │   per-route auth guard (NO global guard):                                  │
        │     requireUser / requireOnboardedUser / requireAdmin  (src/lib/auth.ts)  │
        │       └─ redirect → /login | /onboarding | /home                          │
        └───────────────┬─────────────────────────────────┬──────────────────────--┘
              READ path  │                       WRITE path │
                         ▼                                  ▼
        ┌────────────────────────────┐     ┌─────────────────────────────────────────┐
        │ src/lib/queries.ts (34+ fns)│     │ src/lib/actions/* (7 action modules)     │
        │ getAuthors() decorates rows │     │ zod validate → guard → db.insert/update  │
        │ server-only                 │     │ side-effects deferred via after():       │
        └──────────────┬─────────────┘     │   recordEvent / sendEmail / runStarTrade  │
                       │                    │ revalidatePath() + redirect()             │
                       │                    └──────────────────┬────────────────────────┘
                       ▼                                       ▼
        ┌──────────────────────────────────────────────────────────────────────────┐
        │  Drizzle ORM  (src/db/index.ts singleton, src/db/schema.ts)               │
        └───────────────────────────────┬──────────────────────────────────────────┘
                                         ▼
        ┌──────────────────────────────────────────────────────────────────────────┐
        │  Neon Postgres                                                             │
        │    ss_*  (25 app tables, owned)        hh_applications (read-only archive) │
        └──────────────────────────────────────────────────────────────────────────┘

   EXTERNAL (called from queries/actions/lib, mostly via after()):
     GitHub OAuth + REST  ──  api.github.com (stars, follows, /user, README, stats)
     SMTP (ImprovMX) via nodemailer  ──  every send logged to ss_email_logs
     Vercel Blob  ──  browser uploads direct via /api/blob/upload token; refs saved server-side
     jsdelivr CDN  ──  world-atlas TopoJSON for the map
```

---

## 3. Data model

All PKs are **text** (`crypto.randomUUID()` defaults, or `newId(prefix)` nanoid IDs like `sub_…`). **No DB-level foreign keys / cascades** — referential integrity and cascading deletes are the application's responsibility. Timestamps are auto-set. Indices exist on FKs and on the unique constraints below.

`src/db/schema.ts` defines **25 `ss_*` tables**: `ss_users`, `ss_profiles`, `ss_weeks`, `ss_assignments`, `ss_submissions`, `ss_review_assignments`, `ss_feedback`, `ss_comments`, `ss_star_trades`, `ss_star_grants`, `ss_follows`, `ss_github_snapshots`, `ss_events`, `ss_checkins`, `ss_resources`, `ss_stream_reactions`, `ss_qa_questions`, `ss_qa_upvotes`, `ss_stream_presence`, `ss_email_logs`, `ss_admins`, `ss_announcements`, `ss_login_codes`, `ss_files`, `ss_attachments`. (`ss_star_trades` exists but is legacy — see Trade Stars.)

### Identity
| Table | Purpose / key fields | Invariants |
|---|---|---|
| `ss_users` | Core account: `githubId`, `githubLogin`, `email`, `name`, `avatarUrl`, `accessToken`, `tokenScopes`, `isAdmin`, `isDev`, `applicationId`, `lastLoginAt` | Looked up by `githubId` (OAuth) or `email` (OTP). `applicationId` links to `hh_applications` (soft, immutable). Dev users have `githubId = dev:{email}`. |
| `ss_profiles` | Public profile keyed by `userId`: `username` (unique, optional `@handle`), `displayName`, `bio`, `country`, `city`, social URLs, `tradeStarsEnabled`, `graduate`, `achieved`/`achievedAt` | Existence of a profile = "onboarded". `username` unique (DB index + app check). `tradeStarsEnabled` is the per-person opt-in. |
| `ss_login_codes` | Email OTP: SHA-256 `codeHash`, `expiresAt` (30 min), `attempts`, `consumed` | Creating a new code marks all prior unconsumed codes `consumed=true`. Locks after 6 wrong attempts. |
| `ss_admins` | Organizer allowlist by `email` or `githubLogin` | Live-checked on every `requireAdmin()` — revocation is instant. |
| `ss_github_snapshots` | `userId`, `phase` (`intake` \| `latest`), `publicRepos`, `followers`, `following`, `totalStars`, `capturedAt` | Glow-up = `latest` − `intake`. If either phase missing, the delta is `null`. |

### Program spine
| Table | Purpose | Invariants |
|---|---|---|
| `ss_weeks` | `number`, `theme`, `description`, `streamUrl`, `recordingUrl`, `isPublished`, `isLive`, `startsAt` | "Current week" = `isLive` wins → most-recent published with `startsAt ≤ now` → first published. |
| `ss_assignments` | `weekId`, `title`, `prompt`, `submissionType` (`link\|repo\|file\|text`), `deadline`, `reviewCount`, `recurring` | `recurring` flag is **stored but never read** (dead). |
| `ss_submissions` | `assignmentId`, `userId`, `payload`, `payloadType`, `repoOwner`/`repoName`, `tradeStars` | **One submission per (assignment, user)** — `uniqueIndex(assignmentId, userId)`. Re-submit = UPDATE in place. |
| `ss_review_assignments` | reviewer → submission pairing | `uniqueIndex(reviewerId, submissionId)` makes matching idempotent. `completed` flips when feedback lands. |

### Feedback & discussion
| Table | Purpose | Invariants |
|---|---|---|
| `ss_feedback` | Peer review: `submissionId`, `reviewerId`, `body`, `rating`, **`assigned` (boolean)** | There is **no** `reviewAssignmentId` column. `assigned` is set true when the submission carried a `reviewAssignmentId` form input; the action then updates the matching `ss_review_assignments` row to mark the review complete. |
| `ss_comments` | Polymorphic: `targetType` ∈ **`submission \| profile \| announcement`**, `targetId`, `body` | Validated by the zod enum in `comments.ts` (the inline schema comment `// submission \| profile` is stale — `announcement` is valid). |

### Trade Stars
| Table | Purpose | Invariants |
|---|---|---|
| `ss_star_grants` | The dedup ledger: `fromUserId`, `toUserId`, `repoOwner`, `repoName`, `kind` (`star`), `ok`, `error` | **`uniqueIndex(fromUserId, repoOwner, repoName)`** — each actor stars each repo once. Leaderboard counts only `ok=true`. |
| `ss_follows` | Manual GitHub follow history: `fromUserId`, `toUserId`, `toLogin`, `active` | Unfollow sets `active=false`. Deduped via upsert on `(fromUserId, toUserId)`. |
| `ss_star_trades` | **Legacy** — the live engine uses `ss_star_grants`. | Not the dedup source of truth. |

### Engagement
| Table | Purpose | Invariants |
|---|---|---|
| `ss_events` | The activity "pulse": `type`, `summary`, `actorId/Name`, `targetType/Id`, `weekId`, `meta` (JSONB) | `recordEvent()` never throws; `type` is **not** enum-validated at runtime. |
| `ss_checkins` | Daily check-in: `userId`, `weekId`, `day` | Idempotent (upsert); first insert records a `checkin` event. |
| `ss_stream_reactions` | Emoji reactions per week | 6 fixed emoji in UI. |
| `ss_qa_questions` / `ss_qa_upvotes` | Live Q&A; upvotes deduped | Asking auto-upvotes. Sort: unanswered first, then upvotes desc, then newest. |
| `ss_stream_presence` | Heartbeat for "who's watching" | `activeViewers` = distinct users with `lastSeenAt > now − 90s`. Client heartbeats ~25s. |

### Files
| Table | Purpose | Invariants |
|---|---|---|
| `ss_files` | Dual-mode: **either** `data` (bytea) **or** `url`+`pathname` (Vercel Blob), `uploadedBy` | Exactly one of `{data}` / `{url}` set. |
| `ss_attachments` | Polymorphic link: `fileId`, `targetType` (`announcement\|assignment\|week\|resource\|submission\|profile`), `targetId` | `targetType` is a string, **not** a FK. One file can link to many targets. |
| `ss_resources` | Week materials (file via Blob → `/api/files/[id]`, or external link) | — |

### Admin / email
| Table | Purpose | Invariants |
|---|---|---|
| `ss_announcements` | `title`, `body`, `weekId`, `pinned`, `authorId` | Pinned floats to top; no cap. |
| `ss_email_logs` | Audit of every send: `userId`, `toEmail`, `type`, `subject`, `status` (`sent\|logged\|failed`), `providerId`/`error` | Written **after** the SMTP attempt; source of truth for delivery. |

---

## 4. Subsystem-by-subsystem

### 4.1 Identity, Auth & Session
- **Purpose:** GitHub OAuth + email OTP login, JWT sessions, admin allowlist, soft application gating + profile prefill from the read-only archive.
- **Key files:** `src/lib/auth.ts` (OAuth helpers, guards), `src/lib/session.ts` (JWT lifecycle), `src/lib/login-codes.ts` (OTP), `src/lib/admins.ts` (allowlist), `src/lib/applications.ts` (read-only `hh_applications`), `src/lib/users.ts` (user upserts), `src/lib/env.ts`, `src/proxy.ts`, `src/lib/actions/auth-code.ts`.
- **Public API:** `getCurrentUser`, `getSessionContext`, `requireUser`, `requireOnboardedUser`, `requireAdmin`; `createSession`/`getSessionUserId`/`destroySession`; `createLoginCode`/`verifyCode`/`classifyCode`; `isAllowlistedAdmin`; `upsertUserFromGithub`/`upsertUserByEmail`/`upsertDevUser`/`linkGithubToUser`; `exchangeCodeForToken`/`fetchGithubIdentity`/`githubAuthorizeUrl`; actions `requestLoginCode`/`verifyLoginCode`.
- **Gotchas:** Auth is **per-component, not global** — the Proxy never redirects. Email enumeration intentionally hidden. Session refreshes only when token **>1 day old** (`REFRESH_AFTER = 24h`, `MAX_AGE = 30d`). GitHub scopes (`read:user, user:email, public_repo, user:follow`) captured at sign-in, never re-validated.

### 4.2 Data Layer & Queries
- **Purpose:** Centralized Drizzle client + 34+ server-only read helpers (the read path for SSR).
- **Key files:** `src/db/index.ts` (singleton Pool, globalThis-cached in dev), `src/db/schema.ts`, `src/lib/queries.ts`, `src/lib/users.ts`, `src/lib/ids.ts`.
- **Public API:** `db`; `getAuthors` (batch author decoration, null-safe fallback `"Participant"`); `listWeeks`, `getCurrentWeek`, `listShowcase`, `getSubmissionDetail`, `listPendingReviews`, `getProfileByGithubLogin` (case-insensitive `lower()`), `starLeaderboard`, `getGlowUp`, `getStreak`, etc.; `newId`.
- **Gotchas:** Pool singleton avoids dev hot-reload exhaustion. No transactions/optimistic locking (last-write-wins). `getStreak` walks dates in JS. `hh_applications` reached via **raw `pool.query`**, never Drizzle, never written.

### 4.3 Server Actions (mutations)
- **Purpose:** The only write path. Admin CRUD, engagement, profiles, follow, submissions, peer matching, Trade Stars triggers.
- **Key files:** `src/lib/actions/{admin,comments,engagement,feedback,follow,profile,submissions}.ts` (7 modules) + `src/lib/matching.ts`, `src/lib/weekActions.tsx`.
- **Data flow:** FormData → zod validate → guard → query existing state → Drizzle write → in-band side-effects → deferred via `after()` (email, `recordEvent`, `runStarTrade`) → `revalidatePath` → optional `redirect`.
- **Feedback flow:** `submitFeedback` takes a `reviewAssignmentId` **form input** (not a stored column). It inserts feedback with `assigned = Boolean(reviewAssignmentId)`, and if present, updates the matching `ss_review_assignments` row to mark the review complete. The link is runtime, not a persisted FK.
- **Gotchas:** First submission triggers `assignReviews()` + event + email; **re-submit is a silent UPDATE**. `runStarTrade()` fires via `after()` only on Week 2+ live/publish and on opt-in. Matching uses an **unseeded shuffle**. `recordEvent` never throws.

### 4.4 GitHub Integration & Trade Stars
- **Purpose:** Auto peer-recognition (stars) and manual follows; GitHub stats snapshots; README mirroring.
- **Key files:** `src/lib/github.ts` (REST client), `src/lib/github-parse.ts` (pure URL parsers), `src/lib/startrade.ts` (engine), `src/lib/actions/follow.ts`, `src/components/StarBoard.tsx`, `src/lib/readme-html.ts`, `src/app/stars/page.tsx`.
- **Public API:** `starRepo`/`followUser`/`unfollowUser`/`isFollowing`, `getGithubSocials`, `getRenderedReadmeHtml`/`sanitizeReadmeHtml`, `getGithubStats`; `parseRepo`/`parseLogin`/`normalizeUrl`; `weekAllowsAutoStar` (pure: `(week ?? 0) >= 2`), `autoStarActive`, `needsStar`, `runStarTrade`, `refreshLatestSnapshot`; `starLeaderboard`.
- **Gotchas:** **No auto-follow anywhere** — `followProfile` is the only follow path. Week 1 repos get starred at the Week-2 rollover. GitHub REST without `GITHUB_TOKEN` is ~60 req/hr/IP. README HTML re-sanitized; camo URLs unwrapped. `getRenderedReadmeHtml` cached 10 min.

### 4.5 Student App Shell & Core Routes
- **Purpose:** Authenticated cohort UI under the `(app)` route group; primary navigation lives in the top bar (`NavBar`/`TopNav`), pages render full-width.
- **Key files:** `src/app/(app)/layout.tsx`, `home/page.tsx`, `submissions/{page,[id]}.tsx`, `assignments/[id]/page.tsx`, `feedback/page.tsx`, `discover/page.tsx`, `announcements/{page,[id]}.tsx`; `src/components/{TopNav,WeekBody}.tsx`; `src/lib/weekActions.tsx`, `src/lib/events.ts`.
- **Gotchas:** **Week unlock:** `maxUnlocked = currentWeek?.number ?? 0`; future weeks unreachable even with `?week=`. Top-nav active state via `usePathname`. Logged-out visitors can view public submission pages; forms require sign-in. Feedback form shows only if viewer ≠ owner and hasn't already given feedback.

### 4.6 Admin / Organizer Console
- **Purpose:** `/admin` hub to run the program; every page gated by `requireAdmin()`.
- **Key files:** `src/app/admin/layout.tsx`, `admin/{page,classwork,weeks,people,team,email}/page.tsx`, `src/components/AdminTabs.tsx`, `src/lib/actions/admin.ts`, `src/lib/admins.ts`.
- **Tabs/Routes:** `/admin` (Stream — announcements + counts), `/admin/classwork` (assignments, Run Matching, Remind), `/admin/weeks` (create week, Go Live, resources, weekly update), `/admin/people` (read-only roster), `/admin/team` (allowlist CRUD), `/admin/email` (read-only logs).
- **Gotchas:** `requireAdmin()` is **live** — `ss_admins` revocation is instant; `ADMIN_EMAILS` env backstop **cannot** be revoked in UI. `setWeekLive`/`updateWeek` fire `runStarTrade()` via `after()` for Week 2+ — **errors silent**. **XSS risk:** email templates do `body.replace(/\n/g, '<br>')` without HTML-escaping.

### 4.7 Public, Profile & Onboarding Routes
- **Purpose:** Landing page, three profile-URL shapes + canonicalization, 3-step onboarding, public showcase/demo-day, redirect aliases.
- **Key files:** `src/app/page.tsx`, `src/app/layout.tsx` (`force-dynamic`), `profiles/[id]/page.tsx`, `u/[username]/page.tsx`, `users/[githubusername]/page.tsx`, `profile/edit/page.tsx`, `onboarding/{page,goals,connect}/page.tsx`, `demo-day/page.tsx`, `weeks/[id]/page.tsx`; `src/lib/{profileHref,profileViewData,username}.ts`; `src/components/{ProfileView,OnboardingSteps}.tsx`; `src/lib/actions/profile.ts`.
- **Data flow:** all three profile routes converge on `loadProfileViewData`. Onboarding: details → goals → connect (`onboardingFinish` → `/home`).
- **Redirect aliases:** `/showcase→/discover?tab=showcase`, `/pulse`,`/map→/discover?tab=activity`, `/profiles`,`/people→/discover?tab=people`, `/weeks→/home`, `/stars→/discover?tab=activity`, `/dashboard`,`/check-in`,`/assignments→/home`.

### 4.8 Shared UI Components
- **Key files:** `src/components/*` — Avatar, NavBar, TopNav, MobileMenu, Footer, ui.tsx (shared `Field` primitive), DraftField, MentionDraftField, MentionInput, CheckInButton, FollowButton, SubmitButton, CopyButton, Countdown, CommentThread, StreamPresence, StreamReactions, QaPanel, SubmissionCard, WeekBody, PulseFeed, Readme.
- **Gotchas:** `DraftField` is **intentionally uncontrolled** (SSR-empty, restores after hydration, clears deferred). Optimistic widgets **don't roll back** on server failure. `StreamPresence` renders `null` but heartbeats. `WeekBody` runs 9 parallel queries. `Readme` uses `dangerouslySetInnerHTML` on pre-sanitized HTML.

### 4.9 Files, Attachments, Email, Events & Stream
- **Key files:** `src/lib/{files,attachments,email,events,stream,env}.ts`, `src/app/api/blob/upload/route.ts`, `src/app/api/files/[id]/route.ts`, `src/components/{AttachmentList,BlobFileInput}.tsx`.
- **Gotchas:** **Limits 100 MB / 10 files** (`ATTACHMENT_LIMITS`). `sendEmail` always writes `ss_email_logs`; if SMTP unconfigured, status is `logged`. Download route 307-redirects Blob, streams bytea. `deleteAttachment` only drops `ss_files` when no other attachment references it; deleting a *target* does **not** clean up its attachments. Presence window 90s. `next.config.ts` sets `serverActions.bodySizeLimit: "16mb"`.

### 4.10 Geo/Map, Mentions, Formatting & Misc Libs
- **Key files:** `src/lib/{countries,format,draft,mentions.tsx,readme-html}.ts`, `src/components/{WorldMap,WorldMapClient}.tsx`.
- **Gotchas:** `normalizeCountry` is lenient and can over-match free text. `COUNTRY_CENTROIDS` covers ~73 countries; unmapped → no dot. World atlas fetched from jsdelivr (24h) — CDN outage = empty map, no error.

### 4.11 Database Utility Scripts
- **Location:** `src/scripts/` — `seed.ts` (idempotent: weeks + Week-1 assignment + admins), `clean.ts` (dry-run; `--apply` wipes `ss_*` except `ss_weeks`/`ss_admins`, **refuses if real users exist**), `backfill-usernames.ts`, `dedupe-submissions.ts`.
- **Gotchas:** these use **raw SQL with no compile-time `ss_*` guard** — `drizzle.config.ts` `tablesFilter` protects *migrations*, not these scripts.

---

## 5. Route map

> **Auth:** *public* = no guard; *user* = `requireUser`; *onboarded* = `requireOnboardedUser`; *admin* = `requireAdmin`; *session* = reads session but renders for anyone. Guards live **in the component/action**, not the Proxy.

### Public / marketing
| Route | Auth | What it does |
|---|---|---|
| `/` | session | Landing: hero, stats, world map, pulse, star board, showcase preview |
| `/login` | public | Two-step email/OTP + GitHub + (dev) login |
| `/demo-day` | public | Graduates grid + all projects + star leaderboard |
| `/u/[username]` | public | Pretty handle → redirects to canonical |
| `/users/[githubusername]` | public | **Canonical** profile (GitHub-mirror, README, glow-up); case-insensitive |
| `/profiles/[id]` | public | Fallback profile (no GitHub) |
| `/showcase`,`/pulse`,`/map`,`/profiles`,`/people`,`/stars`,`/weeks`,`/dashboard`,`/check-in`,`/assignments` | n/a | Redirect aliases |

### Student `(app)` + profile/onboarding
| Route | Auth | What it does |
|---|---|---|
| `/home` | onboarded | Weekly check-in (stream/Q&A/assignments/showcase), announcements, glow-up, week switcher |
| `/submissions`, `/submissions/[id]` | onboarded / session | Own gallery; detail + feedback + comments (public-viewable) |
| `/assignments/[id]` | onboarded | Assignment detail + submit form + peer submissions + Trade Stars toggle |
| `/feedback` | onboarded | Pending peer-review inbox |
| `/discover` | onboarded | Tabs: People / Showcase / Activity (map + leaderboard + pulse) |
| `/announcements`, `/announcements/[id]` | onboarded / session | List (pinned-first); detail + comments + attachments |
| `/weeks/[id]` | onboarded | Single week via `WeekBody` |
| `/application` | user | Read-only `hh_applications` archive |
| `/onboarding{,/goals,/connect}` | user | 3-step onboarding |
| `/profile/edit` | user + profile | Edit handle/socials/bio/goals/location; reconnect; trade-stars |

### Admin
| Route | Auth | What it does |
|---|---|---|
| `/admin` | admin | Stream/dashboard |
| `/admin/classwork` | admin | Assignments, Run Matching, deadline reminders |
| `/admin/weeks` | admin | Create/edit weeks, Go Live, resources, weekly update |
| `/admin/people` | admin | Read-only roster |
| `/admin/team` | admin | Organizer allowlist CRUD |
| `/admin/email` | admin | Read-only email log |

### API
| Route | Method | Auth | What it does |
|---|---|---|---|
| `/api/auth/github` | GET | public | OAuth init: state cookie → GitHub authorize |
| `/api/auth/callback/github` | GET | public | OAuth callback: validate state, exchange, upsert/link, session |
| `/api/auth/dev` | POST | dev-gated | Dev login bypass (`DEV_LOGIN_ENABLED` — **defaults true**) |
| `/api/auth/signout` | POST | session | Destroy session → `/` |
| `/api/blob/upload` | POST | user | Short-lived Vercel Blob upload token (enforces 100 MB) |
| `/api/files/[id]` | GET | public | Download: 307-redirect Blob, stream bytea |

> The Proxy `matcher` excludes `/api`, so API routes enforce their own auth.

---

## 6. Cross-cutting concerns

**Auth / session model.** Stateless JWT (`jose` HS256, `sub`=userId, 30-day `MAX_AGE`) in `ss_session` (httpOnly, `sameSite=lax`, secure when https). The Proxy slides the window only when a token is >1 day old, and **never blocks**. Authorization is **per component/action** via `requireUser`/`requireOnboardedUser`/`requireAdmin`. **No global guard** — a page that calls no guard is effectively public.

**The three profile-URL shapes.** `profileHref()` canonicalizes to `/users/[login]` (preferred) → `/profiles/[id]` (fallback) → `/discover`. `/u/[username]` redirects to one of the above. All three resolve through `loadProfileViewData`.

**Trade Stars.** Per-person opt-in (`ss_profiles.tradeStarsEnabled`), **not** per-submission. Gate: `weekAllowsAutoStar = (week ?? 0) >= 2`. `runStarTrade()` runs via `after()`; deduped by `uniqueIndex(fromUserId, repoOwner, repoName)` on `ss_star_grants`. Failures silent. **Follows always manual.** `ss_star_trades` legacy.

**File storage dual-mode.** `ss_files` holds **either** inline bytea (`data`) **or** a Vercel Blob ref. Limit 100 MB / 10 files. Download redirects Blob, streams bytea. Attachments polymorphic (string `targetType`, no FK).

**Polymorphic targeting.** `ss_comments` (`submission | profile | announcement`) and `ss_attachments` (`announcement | assignment | week | resource | submission | profile`) fan out over a string `targetType` with no FK; valid sets enforced by zod at the action boundary.

**Email fallback.** `sendEmail()` sends via SMTP when configured, else logs — but **always** writes `ss_email_logs` (`sent | logged | failed`). Logs are the source of truth, which makes the pipeline testable.

**Events feed.** `recordEvent()` appends to `ss_events` and **never throws**; `listEvents()` returns the most recent (default 40). Powers `/discover?tab=activity`, the landing page, and `PulseFeed`.

**Peer-review matching.** `assignReviews(assignmentId, n?)` assigns each submitter `n` random other submissions, idempotent via `uniqueIndex(reviewerId, submissionId)`. Shuffle is **unseeded**.

**Reliability / graceful degradation.** Side-effects deferred via `after()`; `recordEvent` swallows errors; email always logs; Pool is a globalThis-cached singleton; admin allowlist live-checked; map degrades to empty; README cached + re-sanitized; auth never hard-fails in the Proxy.

---

## 7. How to run / test

```bash
npm run dev          # next dev
npm run build        # next build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint

npm run db:push      # drizzle-kit push  (tablesFilter=['ss_*'] — never touches hh_*)
npm run db:studio    # drizzle-kit studio

npm run seed                 # weeks + Week-1 assignment + admins from ADMIN_EMAILS
npm run clean                # dry-run; --apply wipes ss_* EXCEPT ss_weeks/ss_admins
npm run backfill:usernames   # fill null ss_profiles.username
npm run dedupe:submissions   # collapse dup (assignment,user) submissions

npm test             # vitest run  (tests/unit/**)
npm run test:e2e     # playwright test  (tests/e2e/*.spec.ts — 6 specs)
```

**Testing pyramid:** Unit (Vitest, `tests/unit/`) — pure libs with `server-only` stubbed. E2E (Playwright, `tests/e2e/`) — 6 specs: `attachments`, `feedback`, `instant`, `journey`, `profile-follow`, `smoke` + shared `helpers.ts`; SMTP disabled, dev-login bypass; `attachments.spec.ts` skips if `BLOB_READ_WRITE_TOKEN` unset. `docs/scenarios.md` is a ~100-item acceptance manifest (not executable).

**Key env vars:** `DATABASE_URL`, `AUTH_SECRET`, `GITHUB_ID`/`GITHUB_SECRET`, `NEXT_PUBLIC_BASE_URL` (or `AUTH_URL`), `ADMIN_EMAILS`, `DEV_LOGIN_ENABLED` (default `true`), `SMTP_HOST`/`PORT`/`USER`/`PASS`/`SMTP_FROM`, `BLOB_READ_WRITE_TOKEN`, optional `GITHUB_TOKEN`.

---

## 8. Gotchas & landmines (consolidated)

1. **No global auth guard.** A page/action with no `require*()` call is public.
2. **Proxy ≠ Middleware and never blocks.** `src/proxy.ts` only slides the JWT window. Excludes `/api` and static.
3. **`DEV_LOGIN_ENABLED` defaults `true`** — `/api/auth/dev` is open unless set `false`.
4. **One submission per (assignment, user).** Re-submit is a silent UPDATE; reviews/events/email fire only on first insert.
5. **Trade Stars is per-profile, not per-submission**, Week 2+ only, runs in `after()` with **silent failures**.
6. **Matching shuffle is unseeded** — re-running re-pairs.
7. **Email templates don't HTML-escape** user input — XSS risk.
8. **No DB foreign keys or cascades.** Deleting a target leaves orphaned attachments/comments/grants unless app code cleans up.
9. **Dual file storage** in `ss_files` (exactly one of bytea `data` / Blob `url`). Limit 100 MB / 10 files.
10. **`hh_applications` is read-only, raw SQL only.** `drizzle.config.ts` `tablesFilter=['ss_*']` guards migrations; `clean.ts`/`dedupe-submissions.ts` use raw SQL with **no compile-time guard**.
11. **Admin allowlist:** `ss_admins` live (instant revoke); `ADMIN_EMAILS` env parsed once at startup (needs restart to change).
12. **Email enumeration intentionally hidden** at login.
13. **Glow-up needs both snapshot phases** (`intake` + `latest`).
14. **Optimistic UI widgets don't roll back** on server failure.
15. **`StreamPresence` renders null but is required** for live viewer counts; presence stale after 90s.
16. **`recurring` assignment flag is stored but never read.**
17. **Root layout is `force-dynamic`** — no page caching by default.
18. **`getRenderedReadmeHtml` cached 10 min**, world atlas 24h.
19. **GitHub scopes captured at sign-in, never re-validated.**
20. **Dev users have `githubId = dev:{email}`** — no real GitHub integration.
21. **`ss_star_trades` is legacy**; the live dedup ledger is `ss_star_grants`.
22. **`listEvents` default is 40.**
23. **`ss_feedback` has no `reviewAssignmentId` column** — it stores `assigned`; `reviewAssignmentId` is a form input driving a side-update.
24. **Stale schema comments** — trust code over inline comments (e.g. `ss_comments.targetType` also accepts `announcement`).
25. **`src/db/schema.ts` defines 25 `ss_*` tables.**
