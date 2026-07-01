import Link from "@portal/components/Link";
import {
  listWeeks,
  listAnnouncements,
  countParticipants,
  countSubmissions,
  listMentionablePeople,
} from "@portal/lib/queries";
import {
  createAnnouncement,
  deleteAnnouncement,
  removeAttachment,
} from "@portal/lib/actions/admin";
import { getAttachmentsForMany } from "@portal/lib/files";
import { SubmitButton } from "@portal/components/SubmitButton";
import { SectionCard, Field } from "@portal/components/ui";
import { BlobFileInput } from "@portal/components/BlobFileInput";
import { DraftField } from "@portal/components/DraftField";
import { MentionDraftField } from "@portal/components/MentionDraftField";
import { timeAgo } from "@portal/lib/format";

export default async function AdminStreamPage() {
  const [weeks, posts, participants, submissions, people] = await Promise.all([
    listWeeks(),
    listAnnouncements(30),
    countParticipants(),
    countSubmissions(),
    listMentionablePeople(),
  ]);
  const attachmentsByPost = await getAttachmentsForMany(
    "announcement",
    posts.map((p) => p.id),
  );

  return (
    <div>
      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        <Link href="/admin/classwork" className="card card-hover flex items-center gap-3">
          <span className="text-[24px]">📌</span>
          <div>
            <div className="font-bold">New assignment</div>
            <div className="meta text-[13px]">Set classwork for a week</div>
          </div>
        </Link>
        <Link href="/admin/weeks" className="card card-hover flex items-center gap-3">
          <span className="text-[24px]">🔴</span>
          <div>
            <div className="font-bold">Go live / stream</div>
            <div className="meta text-[13px]">Start a workshop, email everyone</div>
          </div>
        </Link>
        <Link href="/admin/people" className="card card-hover flex items-center gap-3">
          <span className="text-[24px]">👥</span>
          <div>
            <div className="font-bold">{participants} people · {submissions} projects</div>
            <div className="meta text-[13px]">See the cohort</div>
          </div>
        </Link>
      </div>

      {/* Compose announcement — one focused thing */}
      <SectionCard
        title="Post an announcement"
        desc="Shows on everyone's dashboard stream. Optionally email it too."
      >
        <form action={createAnnouncement} className="space-y-4">
          <Field label="Title">
            <DraftField name="title" draftKey="announce:title" className="input" required placeholder="e.g. Week 1 kicks off Monday" />
          </Field>
          <Field label="Message">
            <MentionDraftField name="body" draftKey="announce:body" rows={4} required people={people} placeholder="Write to the cohort… use @ to tag someone" />
            <p className="meta-light text-[12px] mt-1">
              Tip: type <span className="font-semibold">@username</span> to mention
              a student — it links to their profile and emails them.
            </p>
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Attach to a week (optional)">
              <select className="select" name="weekId" defaultValue="">
                <option value="">No specific week</option>
                {weeks.map((w) => (
                  <option key={w.id} value={w.id}>Week {w.number} · {w.theme}</option>
                ))}
              </select>
            </Field>
            <div className="flex items-end gap-5 pb-1">
              <label className="flex items-center gap-2 text-[14px] meta">
                <input type="checkbox" name="pinned" className="accent-primary" /> Pin to top
              </label>
              <label className="flex items-center gap-2 text-[14px] meta">
                <input type="checkbox" name="emailAll" className="accent-primary" /> Also email everyone
              </label>
            </div>
          </div>
          <BlobFileInput label="Attach docs for students to download (optional)" />
          <div className="flex justify-end">
            <SubmitButton className="btn btn-primary" pendingText="Posting…">Post to stream</SubmitButton>
          </div>
        </form>
      </SectionCard>

      {/* Stream */}
      <h2 className="text-heading mb-4">Stream</h2>
      {posts.length === 0 ? (
        <p className="meta">No announcements yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {p.pinned && <span className="badge">📌 pinned</span>}
                  {p.emailSent && <span className="badge badge-muted">emailed</span>}
                  <span className="font-bold text-[18px]">{p.title}</span>
                </div>
                <form action={deleteAnnouncement}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="btn btn-ghost btn-sm text-slate-channel">Delete</button>
                </form>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[15px]">{p.body}</p>
              {(attachmentsByPost.get(p.id) ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(attachmentsByPost.get(p.id) ?? []).map((a) => (
                    <div
                      key={a.attachmentId}
                      className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-muted px-3 py-1.5 text-[13px]"
                    >
                      <a
                        href={`/api/files/${a.fileId}`}
                        download
                        className="font-medium hover:text-primary"
                      >
                        📎 {a.name}
                      </a>
                      <form action={removeAttachment}>
                        <input type="hidden" name="attachmentId" value={a.attachmentId} />
                        <input type="hidden" name="revalidate" value="/admin" />
                        <button className="meta-light hover:text-red-600" title="Remove">
                          ×
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
              <div className="meta-light text-[12px] mt-3">
                {p.authorName ?? "Organizer"} · {timeAgo(p.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
