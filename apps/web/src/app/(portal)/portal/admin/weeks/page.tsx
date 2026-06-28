import { listWeeks } from "@portal/lib/queries";
import {
  createWeek,
  updateWeek,
  setWeekLive,
  sendWeeklyUpdate,
  addResource,
  runStarBatchAction,
  removeAttachment,
} from "@portal/lib/actions/admin";
import { getAttachmentsForMany } from "@portal/lib/files";
import { SubmitButton } from "@portal/components/SubmitButton";
import { SectionCard, Field } from "@portal/components/ui";
import { BlobFileInput } from "@portal/components/BlobFileInput";
import { DraftField } from "@portal/components/DraftField";

export default async function AdminWeeksPage() {
  const weeks = await listWeeks();
  const materials = await getAttachmentsForMany(
    "week",
    weeks.map((w) => w.id),
  );

  return (
    <div>
      <SectionCard title="Add a week" desc="The container for a workshop, its assignments, and resources.">
        <form action={createWeek} className="grid sm:grid-cols-4 gap-4 items-end">
          <Field label="Number">
            <input className="input" name="number" type="number" min={1} required />
          </Field>
          <Field label="Theme" wide>
            <input className="input" name="theme" placeholder="GitHub Profile" required />
          </Field>
          <SubmitButton className="btn btn-primary">Add</SubmitButton>
        </form>
      </SectionCard>

      {weeks.map((w) => (
        <div key={w.id} className="card !p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-[18px]">
              Week {w.number} · {w.theme}{" "}
              {w.isLive && <span className="badge badge-teal ml-2"><span className="live-dot" /> live</span>}
            </div>
            <div className="flex gap-2">
              <form action={setWeekLive}>
                <input type="hidden" name="weekId" value={w.id} />
                <input type="hidden" name="live" value={(!w.isLive).toString()} />
                <SubmitButton className="btn btn-outline btn-sm" pendingText="…">
                  {w.isLive ? "End live" : "Go live 🔴"}
                </SubmitButton>
              </form>
              <form action={runStarBatchAction}>
                <input type="hidden" name="weekId" value={w.id} />
                <SubmitButton className="btn btn-outline btn-sm" pendingText="Trading…">Run star trade ⭐</SubmitButton>
              </form>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="space-y-3">
              <form action={updateWeek} className="space-y-3">
                <input type="hidden" name="id" value={w.id} />
                <Field label="Theme"><input className="input" name="theme" defaultValue={w.theme} /></Field>
                <Field label="Description"><textarea className="textarea" name="description" rows={2} defaultValue={w.description ?? ""} /></Field>
                <Field label="Stream URL (YouTube)"><input className="input" name="streamUrl" defaultValue={w.streamUrl ?? ""} placeholder="https://youtube.com/…" /></Field>
                <Field label="Recording URL"><input className="input" name="recordingUrl" defaultValue={w.recordingUrl ?? ""} /></Field>
                <BlobFileInput label="Add materials students can download (PDFs, slides…)" />
                <label className="flex items-center gap-2 meta text-[14px]">
                  <input type="checkbox" name="isPublished" defaultChecked={w.isPublished} className="accent-primary" /> Published
                </label>
                <SubmitButton className="btn btn-primary btn-sm">Save</SubmitButton>
              </form>
              {(materials.get(w.id) ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(materials.get(w.id) ?? []).map((f) => (
                    <div
                      key={f.attachmentId}
                      className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-muted px-2.5 py-1 text-[12px]"
                    >
                      <a href={`/api/files/${f.fileId}`} download className="font-medium hover:text-primary">
                        📎 {f.name}
                      </a>
                      <form action={removeAttachment}>
                        <input type="hidden" name="attachmentId" value={f.attachmentId} />
                        <input type="hidden" name="revalidate" value="/admin/weeks" />
                        <button className="meta-light hover:text-red-600" title="Remove">×</button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <form action={sendWeeklyUpdate} className="space-y-2">
                <input type="hidden" name="weekId" value={w.id} />
                <Field label="Weekly update email">
                  <DraftField textarea name="body" draftKey={`weekly:${w.id}`} className="textarea" rows={3} placeholder="What's happening this week…" />
                </Field>
                <SubmitButton className="btn btn-outline btn-sm" pendingText="Sending…">📣 Email the cohort</SubmitButton>
              </form>
              <form action={addResource} className="space-y-2">
                <input type="hidden" name="weekId" value={w.id} />
                <Field label="Add a resource">
                  <input className="input mb-2" name="title" placeholder="Title" />
                  <input className="input" name="url" placeholder="https://… (link)" />
                </Field>
                <BlobFileInput label="…or upload a file" hint="Uploaded files become downloadable resources." />
                <SubmitButton className="btn btn-outline btn-sm">+ Add resource</SubmitButton>
              </form>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
