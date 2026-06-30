import { sql } from "./db";

// Admins are managed in the Portal (ss_admins + ADMIN_EMAILS) now — the dashboard
// no longer creates or stores admin passwords. This module exposes only the set of
// admin GitHub logins, used to validate and autocomplete @mentions in comments.

/**
 * GitHub logins of all admins, for @mention validation + autocomplete.
 * Sources: ss_admins.github_login (managed admins) plus the github_login of any
 * ss_users row whose email matches a ss_admins email (covers email-seeded admins,
 * e.g. founders, once they've connected GitHub).
 */
export async function getAdminUsernames(): Promise<string[]> {
  const rows = (await sql`
    SELECT DISTINCT login FROM (
      SELECT lower(github_login) AS login
        FROM ss_admins
       WHERE github_login IS NOT NULL
      UNION
      SELECT lower(u.github_login) AS login
        FROM ss_users u
        JOIN ss_admins a ON lower(a.email) = lower(u.email)
       WHERE u.github_login IS NOT NULL
    ) t
    WHERE login IS NOT NULL
    ORDER BY login
  `) as { login: string }[];
  return rows.map((r) => r.login);
}
