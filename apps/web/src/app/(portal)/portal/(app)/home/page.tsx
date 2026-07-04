import Link from "@portal/components/Link";
import { Pin } from "lucide-react";
import { requireOnboardedUser } from "@portal/lib/auth";
import {
  getCurrentWeek,
  getWeek,
  getWeekByNumber,
  listAnnouncements,
  listAssignmentsForWeek,
  resolveMentions,
} from "@portal/lib/queries";
import { AssignmentWorkSection } from "@portal/components/AssignmentWorkSection";
import { WelcomeWeek } from "@portal/components/WelcomeWeek";
import { extractMentions, MentionText } from "@portal/lib/mentions";
import { getAttachmentsForMany } from "@portal/lib/files";
import { AttachmentList } from "@portal/components/AttachmentList";
import { WeekBody } from "@portal/components/WeekBody";
import { WeekSteps } from "@portal/components/WeekSteps";
import { isWizardWeek, maxUnlockedWeek } from "@portal/lib/weekRoutes";
import { timeAgo } from "@portal/lib/format";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    week?: string;
    error?: string;
    submitted?: string;
    edit?: string;
    step?: string;
  }>;
}) {
  const { user, profile } = await requireOnboardedUser();
  const sp = await searchParams;

  const [currentWeek, announcements] = await Promise.all([
    getCurrentWeek(),
    listAnnouncements(5),
  ]);

  // The "current" week is the furthest-unlocked one. A ?week= switch may show an
  // earlier (already-unlocked) week so people can revisit / keep editing it.
  const requested = sp.week ? await getWeek(sp.week) : null;
  const maxUnlocked = maxUnlockedWeek();
  const week =
    requested &&
    requested.isPublished &&
    requested.number <= maxUnlocked
      ? requested
      : currentWeek;

  const annAttachments = await getAttachmentsForMany(
    "announcement",
    announcements.map((a) => a.id),
  );
  const mentioned = await resolveMentions(
    announcements.flatMap((a) => extractMentions(a.body)),
  );
  const mentionHandles = new Set(mentioned.map((m) => m.username));

  const assignments = week ? await listAssignmentsForWeek(week.id) : [];
  const primaryAssignment = assignments[0] ?? null;

  // Week 0 is the informational welcome — resolve where "Start Week 1 →" points.
  const isWelcomeWeek = week?.number === 0;
  const nextWeek = isWelcomeWeek ? await getWeekByNumber(1) : null;
  const nextWeekHref = nextWeek ? `/home?week=${nextWeek.id}` : "/home";

  return (
    <div className="py-2">
      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[20px] font-semibold mb-2">Announcements</h2>
          <div className="divide-y divide-border">
            {announcements.map((a) => (
              <div key={a.id} className="py-4 first:pt-0">
                <div className="flex items-center gap-1.5">
                  {a.pinned && (
                    <Pin size={14} className="text-primary shrink-0" aria-hidden />
                  )}
                  <Link
                    href={`/announcements/${a.id}`}
                    className="font-semibold text-[17px] hover:text-primary"
                  >
                    {a.title}
                  </Link>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-[15px]">
                  <MentionText text={a.body} valid={mentionHandles} />
                </p>
                <AttachmentList items={annAttachments.get(a.id) ?? []} title="Files" />
                <div className="meta-light text-[12px] mt-2">
                  {a.authorName ?? "Organizer"} · {timeAgo(a.createdAt)} ·{" "}
                  <Link href={`/announcements/${a.id}`} className="link">
                    comment →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {week && isWelcomeWeek ? (
        <WelcomeWeek nextWeekHref={nextWeekHref} />
      ) : week ? (
        <>
          {/* Active week header. The wizard weeks (1: profile, 2: repo showcase)
              open straight into their brief, so skip the redundant theme header. */}
          {!isWizardWeek(week.number) && (
            <section className="mb-2">
              {week.isLive && (
                <div className="mb-3">
                  <span className="badge badge-teal"><span className="live-dot" /> live now</span>
                </div>
              )}
              <h2 className="text-[30px] md:text-[34px] font-semibold leading-tight">
                {week.theme}
              </h2>
              {week.description && (
                <p className="mt-3 text-[17px] text-slate-channel max-w-[70ch]">
                  {week.description}
                </p>
              )}
            </section>
          )}

          {/* Soft week actions only; the assignment itself is rendered below. */}
          <WeekSteps
            week={week}
            userId={user.id}
            profile={profile}
            includeAssignments={false}
          />

          {primaryAssignment && (
            <AssignmentWorkSection
              assignmentId={primaryAssignment.id}
              error={sp.error}
              submitted={sp.submitted === "1"}
              edit={sp.edit === "1"}
              step={sp.step ? Number(sp.step) : undefined}
            />
          )}

          {/* The week itself: stream, live reactions and materials. When an
              assignment is shown, its header hosts the Q&A popover instead. */}
          <div className="mt-10">
            <WeekBody
              week={week}
              userId={user.id}
              isAdmin={user.isAdmin}
              includeQa={!primaryAssignment}
            />
          </div>
        </>
      ) : (
        <p className="meta">
          No week is live yet — your first week unlocks when the program starts.
        </p>
      )}
    </div>
  );
}
