# Testing Guide — AI Foundations

Single Next 16 app: `apps/web`, serving the marketing site (`/`), the cohort
portal (`/portal/*`), and the admin dashboard (`/dashboard/*`) as route groups.
One Neon Postgres DB (`DATABASE_URL`).

## Environment Setup
- Package manager: **npm** (workspaces; single root `package-lock.json`)
- Install: `npm install` at the repo root
- Env: one file, `apps/web/.env.local` (gitignored). Key vars:
  - `DATABASE_URL` (Neon)
  - auth: `AUTH_SECRET`, `AUTH_GITHUB_ID/SECRET`, `ADMIN_EMAILS`
  - portal/dashboard: `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`, `TINYSEND_API_KEY`, `SMTP_*`
  - AI: `ANTHROPIC_API_KEY` (GitWit review)

## Running locally
```bash
npm run dev      # apps/web on :3000
```
Browse `http://localhost:3000` (site), `…/portal`, `…/dashboard` — all one app, no proxy.

## Unit tests
```bash
npm run test                              # vitest, apps/web/tests/unit
npx vitest run tests/unit -w apps/web     # same, explicit
```
- Pure logic in `apps/web/tests/unit/`; `server-only` is stubbed and `@portal`/
  `@site`/`@dashboard` aliased in `apps/web/vitest.config.ts`.
- Includes `tinysend.test.ts` (client contract), `star-reconcile.test.ts`, the
  checklist/route helpers, etc. (144 tests).

## E2E (Playwright)
```bash
npx playwright install chromium
npm run test:e2e -w apps/web
```
NOTE: the portal's e2e specs were not carried over in the single-app
consolidation (they predate the `/portal` route layout and need their
`baseURL`/paths repointed). They remain in git history under the former
`apps/portal/tests/e2e/` — port them as a follow-up.

## tinysend sync (manual verification)
```bash
npm run db:push -w apps/web        # create the ledger table (ss_*-filtered)
npm run seed:tinysend -w apps/web  # mark already-imported emails as synced (no API calls)
# drain the reconciler (idempotent):
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/portal/api/cron/sync-tinysend
```

## Scheduled work
star-trade and tinysend sync run as **Netlify background functions**
(`apps/web/netlify/functions/*.mts`); `apps/web/vercel.json` mirrors the same
schedules for Vercel portability.

## Dashboard attribution migration
One-time, already applied. The script shipped with the former `apps/dashboard`
and was removed in the consolidation; recover it from git history if a re-run is
ever needed.

## Builds (CI / pre-deploy)
```bash
npm run typecheck   # tsc --noEmit
npm run build       # next build (apps/web)
```
