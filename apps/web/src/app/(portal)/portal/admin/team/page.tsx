import { listAdmins } from "@portal/lib/admins";
import { addAdminAction, removeAdminAction } from "@portal/lib/actions/admin";
import { env } from "@portal/lib/env";
import { SubmitButton } from "@portal/components/SubmitButton";
import { SectionCard, Field } from "@portal/components/ui";
import { timeAgo } from "@portal/lib/format";

export default async function AdminTeamPage() {
  const admins = await listAdmins();

  return (
    <div>
      <SectionCard
        title="Organizers"
        desc="Only these people can access this console. Admins are matched on sign-in by email or GitHub username."
      >
        <form action={addAdminAction} className="grid sm:grid-cols-3 gap-3 items-end">
          <Field label="Email or GitHub username" wide>
            <input className="input" name="identifier" required placeholder="james@email.com or octocat" />
          </Field>
          <div className="flex flex-col">
            <Field label="Name (optional)">
              <input className="input" name="name" placeholder="James Murdza" />
            </Field>
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <SubmitButton className="btn btn-primary">Add organizer</SubmitButton>
          </div>
        </form>
      </SectionCard>

      <h2 className="text-heading mb-3">Current organizers</h2>
      <div className="card !p-0 overflow-hidden mb-6">
        {admins.length === 0 ? (
          <div className="p-4 meta">None added yet — the env backstop still applies.</div>
        ) : (
          admins.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3 border-b border-sea-fog last:border-0">
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{a.name ?? a.email ?? a.githubLogin}</div>
                <div className="meta-light text-[13px]">
                  {a.email ?? `@${a.githubLogin}`} · added {timeAgo(a.createdAt)}
                </div>
              </div>
              <form action={removeAdminAction}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="email" value={a.email ?? ""} />
                <button className="btn btn-ghost btn-sm text-slate-channel">Remove</button>
              </form>
            </div>
          ))
        )}
      </div>

      {env.adminEmails.length > 0 && (
        <p className="meta-light text-[13px]">
          Permanent backstop (from <code>ADMIN_EMAILS</code>, can&apos;t be removed
          here): {env.adminEmails.join(", ")}
        </p>
      )}
    </div>
  );
}
