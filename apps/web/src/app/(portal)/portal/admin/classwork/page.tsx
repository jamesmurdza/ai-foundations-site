import Link from "@portal/components/Link";
import { listWeeks, listAllAssignments } from "@portal/lib/queries";
import {
  createAssignment,
  runMatchingAction,
  sendDeadlineReminders,
  removeAttachment,
} from "@portal/lib/actions/admin";
import { getAttachmentsForMany } from "@portal/lib/files";
import { SubmitButton } from "@portal/components/SubmitButton";
import { SectionCard, Field } from "@portal/components/ui";
import { BlobFileInput } from "@portal/components/BlobFileInput";
import { DraftField } from "@portal/components/DraftField";
import { formatDate } from "@portal/lib/format";
import { weekAssignmentHomePath } from "@portal/lib/weekRoutes";

export default async function ClassworkPage() {
  const [weeks, assignments] = await Promise.all([
    listWeeks(),
    listAllAssignments(),
  ]);
  const att = await getAttachmentsForMany(
    "assignment",
    assignments.map((a) => a.id),
  );

  return (
    <div>
      <SectionCard
        title="Create an assignment"
        desc="One assignment, scoped to a week. Participants submit and get peer feedback."
      >
        {weeks.length === 0 ? (
          <p className="meta">
            Add a week first on{" "}
            <Link href="/admin/weeks" className="link">Weeks &amp; stream</Link>.
          </p>
        ) : (
          <form action={createAssignment} className="grid sm:grid-cols-2 gap-4">
            <Field label="Week">
              <select className="select" name="weekId" required>
                {weeks.map((w) => (
                  <option key={w.id} value={w.id}>Week {w.number} · {w.theme}</option>
                ))}
              </select>
            </Field>
            <Field label="Title">
              <DraftField name="title" draftKey="assignment:title" className="input" required placeholder="Refresh your GitHub profile" />
            </Field>
            <Field label="Prompt / instructions" wide>
              <DraftField textarea name="prompt" draftKey="assignment:prompt" className="textarea" rows={3} required placeholder="What should they refresh and submit?" />
            </Field>
            <Field label="Submission type" hint="Any = link, repo, file, or written text.">
              <select className="select" name="submissionType" defaultValue="link">
                <option value="link">Link</option>
                <option value="repo">GitHub repo</option>
                <option value="file">File</option>
                <option value="text">Text</option>
                <option value="any">Any</option>
              </select>
            </Field>
            <Field label="Deadline (optional)">
              <input className="input" name="deadline" type="datetime-local" />
            </Field>
            <Field label="Peer reviews per person" hint="Random matching. 0 turns it off.">
              <input className="input" name="reviewCount" type="number" defaultValue={3} min={0} max={10} />
            </Field>
            <label className="flex items-center gap-2 text-[14px] meta self-end pb-3">
              <input type="checkbox" name="recurring" className="accent-primary" /> Recurring check-in
            </label>
            <div className="sm:col-span-2">
              <BlobFileInput label="Attach docs / starter files for students (optional)" />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <SubmitButton className="btn btn-primary">Post assignment</SubmitButton>
            </div>
          </form>
        )}
      </SectionCard>

      <h2 className="text-heading mb-4">All assignments</h2>
      {assignments.length === 0 ? (
        <div className="card meta">No assignments yet.</div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={weekAssignmentHomePath(a.weekId)}
                  className="font-bold hover:text-signal-blue"
                >
                  {a.title}
                </Link>
                <div className="meta-light text-[13px]">
                  Week {a.weekNumber} · {a.submissionType} · {a.reviewCount} reviews
                  {a.deadline ? ` · due ${formatDate(a.deadline)}` : ""}
                </div>
                {(att.get(a.id) ?? []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(att.get(a.id) ?? []).map((f) => (
                      <div
                        key={f.attachmentId}
                        className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-muted px-2.5 py-1 text-[12px]"
                      >
                        <a href={`/api/files/${f.fileId}`} download className="font-medium hover:text-primary">
                          📎 {f.name}
                        </a>
                        <form action={removeAttachment}>
                          <input type="hidden" name="attachmentId" value={f.attachmentId} />
                          <input type="hidden" name="revalidate" value="/admin/classwork" />
                          <button className="meta-light hover:text-red-600" title="Remove">×</button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <form action={runMatchingAction}>
                  <input type="hidden" name="assignmentId" value={a.id} />
                  <SubmitButton className="btn btn-outline btn-sm" pendingText="Matching…">🎲 Run matching</SubmitButton>
                </form>
                <form action={sendDeadlineReminders}>
                  <input type="hidden" name="assignmentId" value={a.id} />
                  <SubmitButton className="btn btn-outline btn-sm" pendingText="Sending…">⏰ Remind</SubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
