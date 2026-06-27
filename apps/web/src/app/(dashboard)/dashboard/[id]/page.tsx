import Link from "@dashboard/components/Link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { CommentThread } from "@dashboard/components/CommentThread";
import { DecisionEditor } from "@dashboard/components/DecisionEditor";
import { FlowStatusPill, StatusPill } from "@dashboard/components/StatusPill";
import { getAdminUsernames } from "@dashboard/lib/admins";
import { getApplication } from "@dashboard/lib/applications";
import { listComments, markVisited } from "@dashboard/lib/comments";
import { getVisibleQuestions } from "@dashboard/lib/questions";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function ApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await getApplication(id);
  if (!app) notFound();

  const dynamicQs = app.dynamicQuestions ?? [];

  const h = await headers();
  const me = h.get("x-admin-user") ?? "admin";
  const admins = await getAdminUsernames();
  const initialComments = await listComments(id);
  void markVisited(me, id);

  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center text-[13px] text-action hover:text-action-focus"
      >
        ← All applications
      </Link>

      <header className="mt-6 mb-10 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <FlowStatusPill status={app.status} />
          <StatusPill status={app.adminStatus} size="sm" />
        </div>
        <h1 className="text-[36px] font-semibold leading-tight tracking-[-0.022em] text-ink">
          {app.name ?? "Unnamed applicant"}
        </h1>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[14px] text-ink-80">
          {app.email && (
            <a
              href={`mailto:${app.email}`}
              className="text-action hover:text-action-focus"
            >
              {app.email}
            </a>
          )}
          <span className="text-ink-48">
            Submitted {fmtDate(app.submittedAt)}
          </span>
          <span className="text-ink-48">Updated {fmtDate(app.updatedAt)}</span>
        </div>
        {(app.portfolioUrl || app.githubUrl || app.otherUrl) && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
            {app.portfolioUrl && (
              <LinkChip label="Portfolio" href={app.portfolioUrl} />
            )}
            {app.githubUrl && <LinkChip label="GitHub" href={app.githubUrl} />}
            {app.otherUrl && <LinkChip label="Other" href={app.otherUrl} />}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-12">
          {(app.whyText || app.projectText) && (
            <Section title="In their words">
              {app.whyText && (
                <Block label="Why this hacker house?" body={app.whyText} />
              )}
              {app.projectText && (
                <Block
                  label="Recent / current project"
                  body={app.projectText}
                />
              )}
            </Section>
          )}

          {(() => {
            const visible = getVisibleQuestions(app.answers);
            return (
          <Section title={`The ${visible.length} static answers`}>
            <dl className="divide-y divide-hairline">
              {visible.map((q) => (
                <div
                  key={q.id}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4"
                >
                  <dt className="text-[13px] text-ink-48 sm:w-[44%] sm:shrink-0">
                    {q.prompt}
                  </dt>
                  <dd className="text-[14px] text-ink">
                    {app.answers[q.id] ?? (
                      <span className="text-ink-48">—</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Section>
            );
          })()}

          {dynamicQs.length > 0 && (
            <Section title={`Their ${dynamicQs.length} follow-up${dynamicQs.length === 1 ? "" : "s"}`}>
              <div className="space-y-5">
                {dynamicQs.map((q) => (
                  <div key={q.id} className="space-y-1.5">
                    <div className="text-[13px] text-ink-48">{q.question}</div>
                    <div className="text-[14px] text-ink">
                      {app.answers[q.id] ?? (
                        <span className="text-ink-48">No answer</span>
                      )}
                    </div>
                    {q.probes && (
                      <div className="text-[11px] uppercase tracking-[0.1em] text-ink-48/80">
                        probes: {q.probes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
          <DecisionEditor id={app.id} initialStatus={app.adminStatus} />
          <CommentThread
            applicationId={app.id}
            currentUser={me}
            admins={admins}
            initialComments={initialComments}
          />
        </aside>
      </div>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-5 text-[12px] uppercase tracking-[0.18em] text-ink-48">
        {title}
      </h2>
      <div className="rounded-[18px] border border-hairline bg-canvas p-6">
        {children}
      </div>
    </section>
  );
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div className="[&:not(:first-child)]:mt-6 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-hairline [&:not(:first-child)]:pt-6">
      <p className="mb-2 text-[12px] uppercase tracking-[0.12em] text-ink-48">
        {label}
      </p>
      <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">
        {body}
      </p>
    </div>
  );
}

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Already has a scheme (http/https/mailto/tel/ftp/...)
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  // Protocol-relative — //example.com
  if (trimmed.startsWith("//")) return "https:" + trimmed;
  // Bare email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "mailto:" + trimmed;
  // Strip leading slashes so /foo/bar doesn't become https:///foo/bar
  return "https://" + trimmed.replace(/^\/+/, "");
}

function LinkChip({ label, href }: { label: string; href: string }) {
  const normalized = normalizeUrl(href);
  if (!normalized) return null;
  // Show the user-typed form without an https:// prefix so the chip stays tidy.
  const display = href.trim().replace(/^https?:\/\//i, "");
  return (
    <a
      href={normalized}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex h-7 items-center rounded-full border border-hairline px-3 text-ink-80 transition-colors hover:border-ink/30 hover:text-ink"
    >
      <span className="font-medium">{label}</span>
      <span className="ml-2 text-ink-48 truncate max-w-[24ch]">{display}</span>
    </a>
  );
}
