import { sql } from "./db";
import type { AdminStatus, Application, DynamicQuestion } from "./types";

type Row = {
  id: string;
  email: string | null;
  name: string | null;
  answers: Record<string, string> | null;
  dynamic_questions: DynamicQuestion[] | null;
  status: "in_progress" | "submitted";
  why_text: string | null;
  project_text: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  other_url: string | null;
  step: string | null;
  admin_status: AdminStatus | null;
  admin_notes: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  submitted_at: string | Date | null;
  notification_sent_at: string | Date | null;
};

function toIso(value: string | Date | null): string | null {
  if (value === null) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toApplication(r: Row): Application {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    answers: r.answers ?? {},
    dynamicQuestions: r.dynamic_questions ?? null,
    status: r.status,
    whyText: r.why_text,
    projectText: r.project_text,
    portfolioUrl: r.portfolio_url,
    githubUrl: r.github_url,
    otherUrl: r.other_url,
    step: r.step,
    adminStatus: (r.admin_status ?? "pending") as AdminStatus,
    adminNotes: r.admin_notes,
    createdAt: toIso(r.created_at)!,
    updatedAt: toIso(r.updated_at)!,
    submittedAt: toIso(r.submitted_at),
    notificationSentAt: toIso(r.notification_sent_at),
  };
}

export async function listApplications(filters?: {
  status?: "submitted" | "in_progress";
  adminStatus?: AdminStatus;
}): Promise<Application[]> {
  const status = filters?.status;
  const adminStatus = filters?.adminStatus;

  let rows: Row[];
  if (status && adminStatus) {
    rows = (await sql`
      SELECT * FROM hh_applications
       WHERE status = ${status} AND COALESCE(admin_status, 'pending') = ${adminStatus}
       ORDER BY COALESCE(submitted_at, updated_at) DESC
    `) as Row[];
  } else if (status) {
    rows = (await sql`
      SELECT * FROM hh_applications
       WHERE status = ${status}
       ORDER BY COALESCE(submitted_at, updated_at) DESC
    `) as Row[];
  } else if (adminStatus) {
    rows = (await sql`
      SELECT * FROM hh_applications
       WHERE COALESCE(admin_status, 'pending') = ${adminStatus}
       ORDER BY COALESCE(submitted_at, updated_at) DESC
    `) as Row[];
  } else {
    rows = (await sql`
      SELECT * FROM hh_applications
       ORDER BY COALESCE(submitted_at, updated_at) DESC
    `) as Row[];
  }
  return rows.map(toApplication);
}

export async function getApplication(id: string): Promise<Application | null> {
  const rows = (await sql`
    SELECT * FROM hh_applications WHERE id = ${id} LIMIT 1
  `) as Row[];
  return rows.length ? toApplication(rows[0]) : null;
}

export async function updateAdminFields(
  id: string,
  patch: { adminStatus?: AdminStatus; adminNotes?: string | null },
): Promise<Application | null> {
  const next = await getApplication(id);
  if (!next) return null;

  const adminStatus = patch.adminStatus ?? next.adminStatus;
  const adminNotes =
    patch.adminNotes === undefined ? next.adminNotes : patch.adminNotes;

  await sql`
    UPDATE hh_applications
       SET admin_status = ${adminStatus},
           admin_notes  = ${adminNotes},
           updated_at   = NOW()
     WHERE id = ${id}
  `;

  return getApplication(id);
}

export async function deleteApplication(id: string): Promise<boolean> {
  const existing = await getApplication(id);
  if (!existing) return false;

  await sql`DELETE FROM hh_visits WHERE application_id = ${id}`;
  await sql`DELETE FROM hh_comments WHERE application_id = ${id}`;
  await sql`DELETE FROM hh_applications WHERE id = ${id}`;
  return true;
}

export async function listPendingNotifications(
  limit = 50,
): Promise<Application[]> {
  const rows = (await sql`
    SELECT * FROM hh_applications
     WHERE status = 'submitted'
       AND notification_sent_at IS NULL
     ORDER BY submitted_at ASC
     LIMIT ${limit}
  `) as Row[];
  return rows.map(toApplication);
}

export async function markNotified(id: string): Promise<boolean> {
  const rows = (await sql`
    UPDATE hh_applications
       SET notification_sent_at = NOW()
     WHERE id = ${id}
       AND notification_sent_at IS NULL
    RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}

export async function clearNotified(id: string): Promise<void> {
  await sql`
    UPDATE hh_applications
       SET notification_sent_at = NULL
     WHERE id = ${id}
  `;
}

export async function getCounts(): Promise<{
  total: number;
  submitted: number;
  inProgress: number;
  pending: number;
  accepted: number;
  rejected: number;
  waitlist: number;
}> {
  const rows = (await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'submitted')::int AS submitted,
      COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
      COUNT(*) FILTER (WHERE COALESCE(admin_status, 'pending') = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE admin_status = 'accepted')::int AS accepted,
      COUNT(*) FILTER (WHERE admin_status = 'rejected')::int AS rejected,
      COUNT(*) FILTER (WHERE admin_status = 'waitlist')::int AS waitlist
    FROM hh_applications
  `) as Array<{
    total: number;
    submitted: number;
    in_progress: number;
    pending: number;
    accepted: number;
    rejected: number;
    waitlist: number;
  }>;
  const r = rows[0];
  return {
    total: r.total,
    submitted: r.submitted,
    inProgress: r.in_progress,
    pending: r.pending,
    accepted: r.accepted,
    rejected: r.rejected,
    waitlist: r.waitlist,
  };
}
