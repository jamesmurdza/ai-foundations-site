# Testing Guide — AI Foundations monorepo

npm-workspaces monorepo: `apps/site` (Next 14), `apps/portal` (Next 16), `apps/dashboard` (Next 16).
All three share one Neon Postgres DB (`DATABASE_URL`).

## Environment Setup
- Package manager: **npm** (workspaces; single root `package-lock.json`)
- Install: `npm install` at the repo root
- Env: each app has its own `apps/<app>/.env.local` (gitignored). Key vars:
  - all: `DATABASE_URL` (same Neon DB)
  - portal: `AUTH_SECRET`, `AUTH_GITHUB_ID/SECRET`, `NEXT_PUBLIC_BASE_URL`, `CRON_SECRET`, `TINYSEND_API_KEY`, `ADMIN_EMAILS`, `SMTP_*`
  - dashboard: `AUTH_SECRET` (**must equal the portal's**), `ADMIN_EMAILS`, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`, `SMTP_*`
  - site: `PORTAL_ORIGIN`, `DASHBOARD_ORIGIN` (zone deploy URLs; default to localhost in dev)

## Running locally (multi-zone)
```bash
npm run dev:site        # :3000  host — rewrites /portal/* and /dashboard/*
npm run dev:portal      # :3001  served under /portal
npm run dev:dashboard   # :3002  served under /dashboard
```
Then browse `http://localhost:3000` (site), `…/portal`, `…/dashboard` (proxied through the host).

## Unit + integration tests (Portal)
```bash
npm run test -w apps/portal              # all unit + integration (vitest)
npx vitest run tests/unit -w apps/portal # unit only (no external APIs)
```
- Unit: `apps/portal/tests/unit/` (pure logic; `server-only` is stubbed in `vitest.config.ts`).
  Includes `tinysend.test.ts` (client contract: never-throws, in-batch dedup, status handling,
  not-configured) and `star-reconcile.test.ts`.
- Integration: `apps/portal/tests/integration/` — calls the real Anthropic API (needs `ANTHROPIC_API_KEY`).

## E2E (Playwright, Portal)
```bash
npx playwright install chromium
npm run test:e2e -w apps/portal
```
Specs in `apps/portal/tests/e2e/`. NOTE: these predate the `/portal` basePath; when run against
the monorepo they need their `baseURL`/paths pointed at `…/portal` (follow-up).

## tinysend sync (manual verification)
```bash
# 1. create the ledger table (ss_*-filtered; never touches hh_*)
npm run db:push -w apps/portal
# 2. mark already-imported HackerHouse emails as synced (NO API calls)
npm run seed:tinysend -w apps/portal
# 3. drain the reconciler (imports net-new ss_users); idempotent on re-run
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3001/portal/api/cron/sync-tinysend
```

## Dashboard attribution migration (one-time, already applied)
```bash
node --env-file=apps/dashboard/.env.local apps/dashboard/scripts/migrate-attribution.mjs          # dry run
node --env-file=apps/dashboard/.env.local apps/dashboard/scripts/migrate-attribution.mjs --apply   # apply
```

## Builds (CI / pre-deploy)
```bash
npm run build            # builds site, portal, dashboard in sequence
npm run build:portal     # individual
```
