import "server-only";
import { unstable_cache } from "next/cache";
import { pool } from "@/db";
import { normalizeCountry, displayCountry } from "@/lib/countries";

/**
 * Read-only access to the existing, immutable hh_applications table.
 * We NEVER write to it — applications are a private archive (see spec §2).
 */

export type ApplicationRecord = {
  id: string;
  email: string | null;
  name: string | null;
  country: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  otherUrl: string | null;
  answers: Record<string, unknown> | null;
  status: string | null;
  submittedAt: string | null;
  createdAt: string | null;
};

const SELECT = `
  select id, email, name, github_url, portfolio_url, other_url, answers,
         status, submitted_at, created_at
  from hh_applications
`;

function map(row: Record<string, unknown>): ApplicationRecord {
  const answers = (row.answers as Record<string, unknown>) ?? null;
  const rawCountry =
    typeof answers?.q1 === "string" ? (answers.q1 as string).trim() : null;
  return {
    id: row.id as string,
    email: (row.email as string) ?? null,
    name: (row.name as string) ?? null,
    country: rawCountry || null,
    githubUrl: (row.github_url as string) ?? null,
    portfolioUrl: (row.portfolio_url as string) ?? null,
    otherUrl: (row.other_url as string) ?? null,
    answers: (row.answers as Record<string, unknown>) ?? null,
    status: (row.status as string) ?? null,
    submittedAt: row.submitted_at ? String(row.submitted_at) : null,
    createdAt: row.created_at ? String(row.created_at) : null,
  };
}

/**
 * Find the canonical application for an email. Dedupes the known
 * duplicate-applicant case by preferring a submitted, most-recent record.
 */
export async function findApplicationByEmail(
  email: string | null | undefined,
): Promise<ApplicationRecord | null> {
  if (!email) return null;
  const { rows } = await pool.query(
    `${SELECT}
     where lower(email) = lower($1)
     order by (submitted_at is not null) desc,
              submitted_at desc nulls last,
              created_at desc
     limit 1`,
    [email],
  );
  return rows[0] ? map(rows[0]) : null;
}

export async function getApplicationById(
  id: string,
): Promise<ApplicationRecord | null> {
  const { rows } = await pool.query(`${SELECT} where id = $1 limit 1`, [id]);
  return rows[0] ? map(rows[0]) : null;
}

// hh_applications is a large, immutable archive — cache the count for an hour
// instead of re-counting the whole table on every public page render.
const _countApplications = unstable_cache(
  async (): Promise<number> => {
    const { rows } = await pool.query(
      `select count(*)::int as n from hh_applications`,
    );
    return rows[0]?.n ?? 0;
  },
  ["count-applications"],
  { revalidate: 3600 },
);
export async function countApplications(): Promise<number> {
  return _countApplications();
}

/** Public, safe-to-copy fields used to seed a Profile on first sign-in. */
export function publicFieldsFromApplication(app: ApplicationRecord) {
  const key = normalizeCountry(app.country);
  return {
    displayName: app.name ?? null,
    country: key ? displayCountry(key) : (app.country?.trim() || null),
    githubUrl: app.githubUrl ?? null,
    portfolioUrl: app.portfolioUrl ?? null,
    siteUrl: app.portfolioUrl ?? null,
    otherUrl: app.otherUrl ?? null,
    publicEmail: app.email ?? null,
  };
}

/**
 * Match a signing-in user to their application so their profile is effectively
 * pre-made: try email first (every applicant has one), then their GitHub login
 * parsed from the application's github_url (covers a different sign-in email).
 */
export async function findApplicationForUser(opts: {
  email?: string | null;
  githubLogin?: string | null;
}): Promise<ApplicationRecord | null> {
  const byEmail = await findApplicationByEmail(opts.email);
  if (byEmail) return byEmail;

  const login = opts.githubLogin?.trim();
  if (login && /^[a-z0-9-]+$/i.test(login)) {
    const { rows } = await pool.query(
      `${SELECT}
       where github_url ~* ('github[.]com/' || $1 || '($|[/?#])')
       order by (submitted_at is not null) desc,
                submitted_at desc nulls last,
                created_at desc
       limit 1`,
      [login],
    );
    if (rows[0]) return map(rows[0]);
  }
  return null;
}

/**
 * Country distribution across all applicants, normalized for the map.
 *
 * Aggregates by raw country string IN SQL (one row per distinct value) instead
 * of streaming every applicant row out of Postgres, then merges those into the
 * normalized buckets in JS — identical output, a fraction of the data transfer.
 * Cached for an hour since the applicant archive is immutable.
 */
const _applicationCountryCounts = unstable_cache(
  async (): Promise<{ country: string; count: number }[]> => {
    const { rows } = await pool.query(
      `select answers->>'q1' as raw, count(*)::int as n
       from hh_applications
       where jsonb_typeof(answers)='object'
         and answers->>'q1' is not null and trim(answers->>'q1') <> ''
       group by answers->>'q1'`,
    );
    const counts = new Map<string, number>();
    for (const r of rows as { raw: string; n: number }[]) {
      const key = normalizeCountry(r.raw);
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + r.n);
    }
    return [...counts.entries()]
      .map(([key, count]) => ({ country: displayCountry(key), count }))
      .sort((a, b) => b.count - a.count);
  },
  ["application-country-counts"],
  { revalidate: 3600 },
);
export async function applicationCountryCounts(): Promise<
  { country: string; count: number }[]
> {
  return _applicationCountryCounts();
}
