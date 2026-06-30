import { requireUser } from "@/lib/auth";
import {
  getApplicationById,
  findApplicationByEmail,
} from "@/lib/applications";
import { formatDate } from "@/lib/format";

export default async function ApplicationArchivePage() {
  const user = await requireUser();
  const app = user.applicationId
    ? await getApplicationById(user.applicationId)
    : await findApplicationByEmail(user.email);

  return (
    <div className="container-page py-12 max-w-[760px]">
      <div className="badge badge-muted mb-3">Private · read-only archive</div>
      <h1 className="text-[32px]">Your application</h1>
      <p className="meta mt-2 mb-8 max-w-[60ch]">
        This is the application you submitted. It&apos;s visible only to you, can
        never be edited, and is kept separate from your public profile.
      </p>

      {!app ? (
        <div className="card meta">
          We couldn&apos;t find an application linked to your account
          {user.email ? ` (${user.email})` : ""}.
        </div>
      ) : (
        <div className="card !p-7 space-y-5">
          <Row label="Name" value={app.name} />
          <Row label="Email" value={app.email} />
          <Row label="Status" value={app.status} />
          <Row label="Submitted" value={app.submittedAt ? formatDate(app.submittedAt) : "—"} />
          {app.githubUrl && <Row label="GitHub" value={app.githubUrl} />}
          {app.portfolioUrl && <Row label="Portfolio" value={app.portfolioUrl} />}
          {app.otherUrl && <Row label="Other link" value={app.otherUrl} />}

          {app.answers && Object.keys(app.answers).length > 0 && (
            <div className="hairline pt-5">
              <div className="label mb-3">Application answers</div>
              <div className="space-y-4">
                {Object.entries(app.answers).map(([k, val]) => (
                  <div key={k}>
                    <div className="meta-light text-[12px] uppercase tracking-wide">{k}</div>
                    <div className="text-[15px] whitespace-pre-wrap">
                      {typeof val === "string" ? val : JSON.stringify(val, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-4">
      <div className="label w-32 shrink-0 !mb-0">{label}</div>
      <div className="text-[15px] break-all">{value}</div>
    </div>
  );
}
