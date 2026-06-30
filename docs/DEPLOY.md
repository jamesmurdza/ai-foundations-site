# Deploying the unified monorepo (multi-zone)

One Git repo → **three Vercel projects**, one domain (`aifoundations.school`), one Neon DB.
The site is the host zone; it rewrites `/portal/*` and `/dashboard/*` to the other two.

## 1. Vercel projects (one repo, three Root Directories)
Create/point three Vercel projects at this repo, each with a distinct **Root Directory**:

| Project | Root Directory | Serves | Domain |
|---|---|---|---|
| `ai-foundations-site` | `apps/site` | `/` (host) | `aifoundations.school` |
| `ai-foundations-portal` | `apps/portal` | `/portal` | (internal `*.vercel.app`) |
| `hackerhouse-dashboard` | `apps/dashboard` | `/dashboard` | (internal `*.vercel.app`) |

Only the **site** project gets the `aifoundations.school` domain. The portal/dashboard are
reached through the site's rewrites, so their `*.vercel.app` URLs are internal plumbing.

> Vercel: set "Root Directory" in each project's Settings → General. Build command and install
> run from the repo root (workspaces), output is per-app.

## 2. Environment variables (Vercel → each project)
**site**: `DATABASE_URL`, `PORTAL_ORIGIN=https://<portal>.vercel.app`,
`DASHBOARD_ORIGIN=https://<dashboard>.vercel.app`

**portal**: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`,
`NEXT_PUBLIC_BASE_URL=https://aifoundations.school/portal`, `AUTH_URL=https://aifoundations.school/portal`,
`CRON_SECRET`, `TINYSEND_API_KEY`, `ADMIN_EMAILS`, `SMTP_*`, `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`

**dashboard**: `DATABASE_URL`, `AUTH_SECRET` (**identical to the portal's** — the shared session
JWT must verify in both), `ADMIN_EMAILS`, `NEXT_PUBLIC_SITE_URL=https://aifoundations.school`,
`CRON_SECRET`, `SMTP_*`

## 3. GitHub OAuth app (manual, one-time)
Add an Authorized callback URL so login works under `/portal`:
```
https://aifoundations.school/portal/api/auth/callback/github
```
(Keep the old `ai-foundations-portal.vercel.app/...` callback during transition if needed.)

## 4. Database (one-time)
From a machine with the prod `DATABASE_URL`:
```bash
npm run db:push -w apps/portal     # creates ss_tinysend_subscribers (ss_*-filtered; safe)
npm run seed:tinysend -w apps/portal   # mark already-imported hh_applications emails as synced
```
The dashboard attribution migration has already been applied (burhan→burhankhatri,
james→jamesmurdza). `taniya`/`fleo` were not migrated (no known GitHub login) — add them to
`MAPPING` in `apps/dashboard/scripts/migrate-attribution.mjs` and re-run `--apply` once known.

## 5. Crons (per project `vercel.json`, automatic)
- portal: `/portal/api/cron/reconcile-stars` (*/5), `/portal/api/cron/sync-tinysend` (*/10)
- dashboard: `/dashboard/api/cron/notify-submissions` (*/15)
All authenticate with `CRON_SECRET`.

## How auth works across zones
The portal sets the `ss_session` JWT cookie with `path=/` on `aifoundations.school`, so one
GitHub login authenticates both `/portal` and `/dashboard`. The dashboard's `proxy.ts` verifies
that JWT with the shared `AUTH_SECRET` and checks the same admin allowlist
(`ADMIN_EMAILS` / `ss_admins`). Unauthenticated → `/portal/login`; signed-in non-admin → `/portal/home`.

## Smoke test after deploy
1. `https://aifoundations.school/` and `/summer-school` load (site).
2. `/portal/login` → GitHub login → lands on `/portal/home`; a Server Action (profile save) works.
3. `/dashboard` while logged out → redirects to `/portal/login`; as an admin → loads.
4. `curl -H "Authorization: Bearer $CRON_SECRET" https://aifoundations.school/portal/api/cron/sync-tinysend` → `{...}` (401 on bad secret).
