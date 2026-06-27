import { desc, sql } from "drizzle-orm";
import { db } from "@portal/db";
import { emailLogs } from "@portal/db/schema";
import { smtpConfigured, env } from "@portal/lib/env";
import { formatDateTime } from "@portal/lib/format";

export default async function AdminEmailPage() {
  const [statusCounts, recent] = await Promise.all([
    db
      .select({ status: emailLogs.status, n: sql<number>`count(*)::int` })
      .from(emailLogs)
      .groupBy(emailLogs.status),
    db.select().from(emailLogs).orderBy(desc(emailLogs.createdAt)).limit(25),
  ]);

  return (
    <div>
      <h2 className="text-heading mb-1">Email</h2>
      <div className="meta mb-6 flex items-center gap-2">
        {smtpConfigured ? (
          <>
            <span className="badge badge-teal">SMTP connected</span>
            sending via {env.smtpHost} as {env.smtpUser}
          </>
        ) : (
          <span className="badge badge-muted">
            SMTP not configured — emails are logged only (set SMTP_* in .env.local)
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-5">
        {statusCounts.length === 0 ? (
          <span className="meta">No emails sent yet.</span>
        ) : (
          statusCounts.map((s) => (
            <span
              key={s.status}
              className={`pill ${s.status === "failed" ? "bg-ice-tint text-slate-channel" : "bg-ice-tint text-signal-blue"}`}
            >
              {s.status}: {s.n}
            </span>
          ))
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        {recent.length === 0 ? (
          <div className="p-4 meta">Nothing yet.</div>
        ) : (
          recent.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-3 px-4 py-2 border-b border-sea-fog last:border-0 text-[14px]"
            >
              <span className="truncate flex-1">{e.toEmail}</span>
              <span className="meta-light">{e.type}</span>
              <span className={e.status === "failed" ? "text-slate-channel" : "text-active-teal"}>
                {e.status}
              </span>
              <span className="meta-light text-[12px]">{formatDateTime(e.createdAt)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
