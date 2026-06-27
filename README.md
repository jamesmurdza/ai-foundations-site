# AI Foundations — monorepo

npm-workspaces monorepo unifying the three AI Foundations apps behind one domain
(`aifoundations.school`) and one shared Neon Postgres database.

## Apps

| Workspace | Stack | Served at | Source of truth |
|---|---|---|---|
| `apps/site` | Next 14 | `aifoundations.school` (host zone) | marketing site + `/summer-school` application |
| `apps/portal` | Next 16 | `aifoundations.school/portal` | cohort portal (auth, submissions, discover) |
| `apps/dashboard` | Next 16 | `aifoundations.school/dashboard` | applicant-review dashboard |

The Portal and Dashboard are **Next.js multi-zones**: each sets `basePath` and the site
rewrites `/portal/*` and `/dashboard/*` to their deployments. Each app keeps its own
Next/React/Tailwind versions.

## Shared packages

| Package | Purpose |
|---|---|
| `packages/db` | one Neon connection — Drizzle (`ss_*`) + raw `sql` helper (`hh_*`) |
| `packages/auth` | shared GitHub-OAuth session verification + admin check |

## Develop

```bash
npm install            # one root lockfile, hoisted workspaces
npm run dev:site       # :3000 (host)
npm run dev:portal     # :3001
npm run dev:dashboard  # :3002
```

Each app needs its own `apps/<app>/.env.local` (gitignored). See each app's `.env.example`.

## History

`apps/portal` and `apps/dashboard` were imported from their standalone repos
(`burhankhatri/AIFoundationsSummerSchool`, `burhankhatri/HackerHouse`); full history
remains in those remotes.
