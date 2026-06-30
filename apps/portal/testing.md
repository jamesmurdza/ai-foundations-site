# Testing Guide

## Environment Setup
- Package manager: **npm** (Node 25, Next.js 16)
- Required env vars (`.env.local`, gitignored):
  - `DATABASE_URL` — Neon Postgres connection string
  - `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — GitHub OAuth app (real login + Trade Stars)
  - `AUTH_SECRET` — JWT session signing secret
  - `NEXT_PUBLIC_BASE_URL` / `AUTH_URL` — site origin (controls cookie `Secure`)
  - `ADMIN_EMAILS` — comma list granted organizer access on login
  - `DEV_LOGIN_ENABLED=true` — enables the email-only dev login used by E2E
  - `RESEND_API_KEY` — optional; if unset, emails are recorded to `ss_email_logs` and logged, not sent
- Database: Neon (shared). Schema lives in `src/db/schema.ts`; all tables are `ss_*`
  and coexist with the existing read-only `hh_*` applicant tables.
  - Apply schema: `npm run db:push`
  - Seed weeks + Week 1 assignment + admins: `npm run seed`
- Services: none beyond Neon. Email/GitHub are called over HTTPS and degrade gracefully.

## Running Tests

### Unit Tests (Vitest)
Command: `npm test`
Location: `tests/unit/` — pure logic (URL parsing, formatting, geo projection).

### E2E Tests (Playwright)
Setup (one time): `npx playwright install chromium`
Command: `npm run test:e2e`
Location: `tests/e2e/`
- Playwright boots the dev server automatically (`webServer` in `playwright.config.ts`)
  at `http://localhost:3000`.
- Tests authenticate via the **dev login** (no GitHub round-trip needed).
- Coverage: landing + public pages, protected-route redirect, sign-up →
  onboarding → dashboard → directory, submit → confirmation → showcase +
  Trade Stars opt-in, check-in streak, peer feedback + comments across two users,
  and document attachments (admin uploads a doc on an assignment / announcement /
  week → a student downloads the exact bytes; student submission uploads; the
  download route's 404 + attachment headers) in `tests/e2e/attachments.spec.ts`.
- 100 end-to-end usage scenarios (student + admin) are catalogued in
  `docs/scenarios.md`, with a map to the specs that automate them.

### Typecheck / Build
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — full production build (also type-checks)

## Debugging Failed Tests
- Single E2E test: `npx playwright test tests/e2e/journey.spec.ts -g "showcase"`
- Headed browser: `npx playwright test --headed`
- Repeat to catch flake: `npx playwright test --repeat-each=3`
- Trace (on retry): `npx playwright show-trace test-results/**/trace.zip`
- Watch unit tests: `npm run test:watch`

## Notes
- E2E sign-ups create real rows in Neon (unique timestamped emails) — expected.
- Cookies are `Secure` only when `NEXT_PUBLIC_BASE_URL` is `https://`, so auth works
  over local http and on https deploys.
