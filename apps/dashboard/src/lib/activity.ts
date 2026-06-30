import { sql } from "./db";

export type ActivityEvent =
  | {
      kind: "comment";
      id: string;
      at: string;
      actor: string;
      applicationId: string;
      applicantName: string | null;
      applicantEmail: string | null;
      body: string;
      mentions: string[];
    }
  | {
      kind: "star";
      id: string;
      at: string;
      actor: string;
      applicationId: string;
      applicantName: string | null;
      applicantEmail: string | null;
    };

type CommentRow = {
  id: string;
  application_id: string;
  author: string;
  body: string;
  mentions: string[] | null;
  created_at: string | Date;
  applicant_name: string | null;
  applicant_email: string | null;
};

type StarRow = {
  username: string;
  application_id: string;
  starred_at: string | Date;
  applicant_name: string | null;
  applicant_email: string | null;
};

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export async function getActivity(limit = 60): Promise<ActivityEvent[]> {
  const [commentsRaw, starsRaw] = await Promise.all([
    sql`
      SELECT c.id            AS id,
             c.application_id AS application_id,
             c.author         AS author,
             c.body           AS body,
             c.mentions       AS mentions,
             c.created_at     AS created_at,
             a.name           AS applicant_name,
             a.email          AS applicant_email
        FROM hh_comments c
        JOIN hh_applications a ON a.id = c.application_id
       ORDER BY c.created_at DESC
       LIMIT ${limit}
    `,
    sql`
      SELECT s.username       AS username,
             s.application_id AS application_id,
             s.starred_at     AS starred_at,
             a.name           AS applicant_name,
             a.email          AS applicant_email
        FROM hh_stars s
        JOIN hh_applications a ON a.id = s.application_id
       ORDER BY s.starred_at DESC
       LIMIT ${limit}
    `,
  ]);
  const comments = commentsRaw as CommentRow[];
  const stars = starsRaw as StarRow[];

  const events: ActivityEvent[] = [];

  for (const c of comments) {
    events.push({
      kind: "comment",
      id: `c:${c.id}`,
      at: toIso(c.created_at),
      actor: c.author,
      applicationId: c.application_id,
      applicantName: c.applicant_name,
      applicantEmail: c.applicant_email,
      body: c.body,
      mentions: c.mentions ?? [],
    });
  }

  for (const s of stars) {
    events.push({
      kind: "star",
      id: `s:${s.username}:${s.application_id}`,
      at: toIso(s.starred_at),
      actor: s.username,
      applicationId: s.application_id,
      applicantName: s.applicant_name,
      applicantEmail: s.applicant_email,
    });
  }

  events.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  return events.slice(0, limit);
}
