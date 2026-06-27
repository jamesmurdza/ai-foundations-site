import { sql } from "./db";

export type StarMap = Record<string, string[]>; // application_id -> [usernames]

export async function getStars(): Promise<StarMap> {
  const rows = (await sql`
    SELECT application_id, username
      FROM hh_stars
     ORDER BY starred_at ASC
  `) as Array<{ application_id: string; username: string }>;
  const out: StarMap = {};
  for (const r of rows) {
    if (!out[r.application_id]) out[r.application_id] = [];
    out[r.application_id].push(r.username);
  }
  return out;
}

export async function addStar(
  username: string,
  applicationId: string,
): Promise<void> {
  await sql`
    INSERT INTO hh_stars (username, application_id)
    VALUES (${username}, ${applicationId})
    ON CONFLICT (username, application_id) DO NOTHING
  `;
}

export async function removeStar(
  username: string,
  applicationId: string,
): Promise<void> {
  await sql`
    DELETE FROM hh_stars
     WHERE username = ${username}
       AND application_id = ${applicationId}
  `;
}

export type StarEvent = {
  username: string;
  applicationId: string;
  applicantName: string | null;
  applicantEmail: string | null;
  starredAt: string;
};

export async function getRecentStarEvents(limit = 30): Promise<StarEvent[]> {
  const rows = (await sql`
    SELECT s.username       AS username,
           s.application_id AS application_id,
           s.starred_at     AS starred_at,
           a.name           AS applicant_name,
           a.email          AS applicant_email
      FROM hh_stars s
      JOIN hh_applications a ON a.id = s.application_id
     ORDER BY s.starred_at DESC
     LIMIT ${limit}
  `) as Array<{
    username: string;
    application_id: string;
    starred_at: string | Date;
    applicant_name: string | null;
    applicant_email: string | null;
  }>;
  return rows.map((r) => ({
    username: r.username,
    applicationId: r.application_id,
    applicantName: r.applicant_name,
    applicantEmail: r.applicant_email,
    starredAt:
      r.starred_at instanceof Date
        ? r.starred_at.toISOString()
        : new Date(r.starred_at).toISOString(),
  }));
}
