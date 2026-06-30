import { nanoid } from "nanoid";

import { getAdminUsernames } from "./admins";
import { sql } from "./db";

export type Comment = {
  id: string;
  applicationId: string;
  author: string;
  body: string;
  mentions: string[];
  createdAt: string;
};

type Row = {
  id: string;
  application_id: string;
  author: string;
  body: string;
  mentions: string[] | null;
  created_at: string | Date;
};

function toComment(r: Row): Comment {
  return {
    id: r.id,
    applicationId: r.application_id,
    author: r.author,
    body: r.body,
    mentions: r.mentions ?? [],
    createdAt:
      r.created_at instanceof Date
        ? r.created_at.toISOString()
        : new Date(r.created_at).toISOString(),
  };
}

export async function parseMentions(body: string): Promise<string[]> {
  const admins = new Set(await getAdminUsernames());
  const found = new Set<string>();
  for (const match of body.matchAll(/@([A-Za-z0-9_]+)/g)) {
    const name = match[1].toLowerCase();
    if (admins.has(name)) found.add(name);
  }
  return [...found];
}

export async function listComments(applicationId: string): Promise<Comment[]> {
  const rows = (await sql`
    SELECT id, application_id, author, body, mentions, created_at
      FROM hh_comments
     WHERE application_id = ${applicationId}
     ORDER BY created_at ASC
  `) as Row[];
  return rows.map(toComment);
}

export async function addComment(
  applicationId: string,
  author: string,
  body: string,
): Promise<Comment> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("empty_body");
  const mentions = await parseMentions(trimmed);
  const id = nanoid(16);

  await sql`
    INSERT INTO hh_comments (id, application_id, author, body, mentions)
    VALUES (${id}, ${applicationId}, ${author}, ${trimmed.slice(0, 5000)}, ${mentions})
  `;

  const rows = (await sql`
    SELECT id, application_id, author, body, mentions, created_at
      FROM hh_comments
     WHERE id = ${id}
  `) as Row[];

  return toComment(rows[0]);
}

export async function markVisited(
  username: string,
  applicationId: string,
): Promise<void> {
  await sql`
    INSERT INTO hh_visits (username, application_id, last_visit_at)
    VALUES (${username}, ${applicationId}, NOW())
    ON CONFLICT (username, application_id)
    DO UPDATE SET last_visit_at = NOW()
  `;
}

export type UnreadByApp = Record<string, { total: number; mentioned: number }>;

export async function getUnreadFor(username: string): Promise<UnreadByApp> {
  const rows = (await sql`
    WITH visits AS (
      SELECT application_id, last_visit_at
        FROM hh_visits
       WHERE username = ${username}
    )
    SELECT
      c.application_id AS app,
      COUNT(*) FILTER (WHERE c.author <> ${username})::int AS total,
      COUNT(*) FILTER (WHERE c.author <> ${username} AND ${username} = ANY(c.mentions))::int AS mentioned
    FROM hh_comments c
    LEFT JOIN visits v ON v.application_id = c.application_id
    WHERE v.last_visit_at IS NULL OR c.created_at > v.last_visit_at
    GROUP BY c.application_id
  `) as Array<{ app: string; total: number; mentioned: number }>;

  const out: UnreadByApp = {};
  for (const r of rows) {
    out[r.app] = { total: r.total, mentioned: r.mentioned };
  }
  return out;
}

export type MentionNotification = {
  commentId: string;
  applicationId: string;
  applicantName: string | null;
  applicantEmail: string | null;
  author: string;
  body: string;
  createdAt: string;
  unread: boolean;
};

export async function getMentionNotifications(
  username: string,
  limit = 50,
): Promise<MentionNotification[]> {
  const rows = (await sql`
    WITH visits AS (
      SELECT application_id, last_visit_at
        FROM hh_visits
       WHERE username = ${username}
    )
    SELECT c.id            AS comment_id,
           c.application_id AS application_id,
           c.author          AS author,
           c.body            AS body,
           c.created_at      AS created_at,
           a.name            AS applicant_name,
           a.email           AS applicant_email,
           (v.last_visit_at IS NULL OR c.created_at > v.last_visit_at) AS is_unread
      FROM hh_comments c
      JOIN hh_applications a ON a.id = c.application_id
      LEFT JOIN visits v ON v.application_id = c.application_id
     WHERE c.author <> ${username}
       AND ${username} = ANY(c.mentions)
     ORDER BY c.created_at DESC
     LIMIT ${limit}
  `) as Array<{
    comment_id: string;
    application_id: string;
    author: string;
    body: string;
    created_at: string | Date;
    applicant_name: string | null;
    applicant_email: string | null;
    is_unread: boolean;
  }>;

  return rows.map((r) => ({
    commentId: r.comment_id,
    applicationId: r.application_id,
    applicantName: r.applicant_name,
    applicantEmail: r.applicant_email,
    author: r.author,
    body: r.body,
    createdAt:
      r.created_at instanceof Date
        ? r.created_at.toISOString()
        : new Date(r.created_at).toISOString(),
    unread: r.is_unread,
  }));
}

export async function getCommentCounts(): Promise<Record<string, number>> {
  const rows = (await sql`
    SELECT application_id, COUNT(*)::int AS n
      FROM hh_comments
     GROUP BY application_id
  `) as Array<{ application_id: string; n: number }>;
  const out: Record<string, number> = {};
  for (const r of rows) out[r.application_id] = r.n;
  return out;
}

export async function getDailySubmissions(
  days = 30,
): Promise<{ date: string; submitted: number; total: number }[]> {
  const rows = (await sql`
    WITH dates AS (
      SELECT generate_series(
        (NOW() AT TIME ZONE 'UTC')::date - INTERVAL '${sql.unsafe(String(days - 1))} days',
        (NOW() AT TIME ZONE 'UTC')::date,
        '1 day'::interval
      )::date AS d
    )
    SELECT
      to_char(d.d, 'YYYY-MM-DD') AS date,
      COUNT(a.id) FILTER (WHERE a.status = 'submitted')::int AS submitted,
      COUNT(a.id)::int AS total
    FROM dates d
    LEFT JOIN hh_applications a
      ON DATE(COALESCE(a.submitted_at, a.created_at) AT TIME ZONE 'UTC') = d.d
    GROUP BY d.d
    ORDER BY d.d ASC
  `) as Array<{ date: string; submitted: number; total: number }>;

  return rows;
}
