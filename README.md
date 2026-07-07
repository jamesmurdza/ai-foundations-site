# AI Foundations

A single Next.js 16 app (`apps/web`) serving all of `aifoundations.school` behind
one domain and one shared Neon Postgres database. It's an npm-workspaces monorepo
with one workspace today (`apps/web`); the layout leaves room for more.

## Zones

The app is one Next.js project; the three areas live under route groups in
`apps/web/src/app`, with their components/lib under `apps/web/src/<zone>`:

| Zone | URL | Source |
|---|---|---|
| Marketing site | `/` | `(site)` route group · `src/site` |
| Cohort portal | `/portal/*` | `(portal)` route group · `src/portal` |
| Admin dashboard | `/dashboard/*` | `(dashboard)` route group · `src/dashboard` |

There is **no Next `basePath`** — each zone lives under a literal route segment.
Client navigation is prefixed via `@portal/components/Link`, `@portal/lib/nav`
(redirect/usePathname shims), and `withBase()` from `@portal/lib/paths`.

## Develop

```bash
npm install      # one root lockfile, hoisted workspaces
npm run dev      # apps/web (Next dev server)
```

Local secrets live in `apps/web/.env.local` (gitignored).

## Verify

```bash
npm run typecheck   # tsc --noEmit (apps/web)
npm run test        # vitest unit tests (apps/web/tests/unit)
npm run test:e2e    # Playwright (apps/web)
npm run build       # next build (apps/web)
```

## Deploy

One Netlify site builds `apps/web` (`netlify.toml` → `base = "apps/web"`) and
serves all three zones. Scheduled work runs as Netlify background functions in
`apps/web/netlify/functions` (`apps/web/vercel.json` mirrors the same crons for
Vercel portability). See `docs/DEPLOY.md`.
