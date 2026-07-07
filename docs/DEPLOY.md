# Deploying AI Foundations (single app)

One Git repo → **one Netlify site**, one domain (`aifoundations.school`), one Neon
DB. `apps/web` is a single Next.js app that serves all three zones (`/`,
`/portal/*`, `/dashboard/*`) from route groups — no multi-zone rewrites.

## 1. Netlify site
`netlify.toml` (repo root) drives the build:

```toml
[build]
  base = "apps/web"      # Netlify installs from the repo-root lockfile, builds apps/web
  command = "npm run build"
  publish = ".next"      # relative to base → apps/web/.next
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Point the `aifoundations.school` domain at this site. That's the whole deploy.

## 2. Environment variables (Netlify → Site settings)
One app, one set of vars:
`DATABASE_URL`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`,
`NEXT_PUBLIC_SITE_URL=https://aifoundations.school`, `ADMIN_EMAILS`,
`CRON_SECRET`, `TINYSEND_API_KEY`, `SMTP_*`, `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`.

## 3. GitHub OAuth app (manual, one-time)
Authorized callback URL:
```
https://aifoundations.school/portal/api/auth/callback/github
```

## 4. Database (one-time)
From a machine with the prod `DATABASE_URL`:
```bash
npm run db:push -w apps/web        # creates ss_tinysend_subscribers (ss_*-filtered; safe)
npm run seed:tinysend -w apps/web  # mark already-imported emails as synced
```
The dashboard attribution migration was already applied (burhan→burhankhatri,
james→jamesmurdza). Its script shipped with the former `apps/dashboard` and was
removed in the consolidation — recover from git history if a re-run is needed.

## 5. Scheduled work (Netlify background functions)
`apps/web/netlify/functions/` runs the long jobs off the request path:
- `star-trade-background.mts` — cohort star reconciliation
- `tinysend-sync-background.mts` — mailing-list reconciler
- `cron-fallback.mts` — twice-daily safety net

`apps/web/vercel.json` mirrors the same schedules (`/portal/api/cron/reconcile-stars`,
`/portal/api/cron/sync-tinysend`, `/dashboard/api/cron/notify-submissions`) for
Vercel portability. All authenticate with `CRON_SECRET`.

## How auth works across zones
One app, one session. Login sets the `ss_session` JWT cookie with `path=/` on
`aifoundations.school`, so a single GitHub login authenticates both `/portal` and
`/dashboard`. `apps/web/src/proxy.ts` verifies that JWT with `AUTH_SECRET` and
checks the admin allowlist (`ADMIN_EMAILS` / `ss_admins`). Unauthenticated →
`/portal/login`; signed-in non-admin hitting the dashboard → `/portal/home`.

## Smoke test after deploy
1. `https://aifoundations.school/` and `/summer-school` load (site).
2. `/portal` → GitHub login → lands on `/portal/home`; a Server Action (profile save) works.
3. `/dashboard` while logged out → redirects to `/portal/login`; as an admin → loads.
4. `curl -H "Authorization: Bearer $CRON_SECRET" https://aifoundations.school/portal/api/cron/sync-tinysend` → `{...}` (401 on bad secret).
