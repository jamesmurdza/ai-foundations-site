import { requireOnboardedUser } from "@portal/lib/auth";
import { redirect } from "@portal/lib/nav";
import {
  getWeek,
  getWeekByNumber,
  listAssignmentsForWeek,
  getMaxUnlockedWeekNumber,
} from "@portal/lib/queries";
import { AssignmentWorkSection } from "@portal/components/AssignmentWorkSection";
import { WelcomeWeek } from "@portal/components/WelcomeWeek";

// A single week's lesson. The curriculum weeks each get their own page here (the
// hub is /lessons); the old /home is gone. `[week]` is the stable week id.
export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ week: string }>;
  searchParams: Promise<{
    error?: string;
    submitted?: string;
    edit?: string;
    step?: string;
  }>;
}) {
  const { user } = await requireOnboardedUser();
  const { week: weekId } = await params;
  const sp = await searchParams;

  const week = await getWeek(weekId);
  if (!week || !week.isPublished) redirect("/lessons");

  // Sequential gating: a week stays locked until the previous one is submitted.
  // Guard the route itself so a locked week can't be opened by direct URL.
  if (week.number > (await getMaxUnlockedWeekNumber(user.id))) {
    redirect("/lessons");
  }

  // Week 0 is the informational welcome — no assignment.
  if (week.number === 0) {
    const nextWeek = await getWeekByNumber(1);
    const nextWeekHref = nextWeek ? `/lessons/${nextWeek.id}` : "/lessons";
    return (
      <div className="py-2">
        <WelcomeWeek nextWeekHref={nextWeekHref} />
      </div>
    );
  }

  const assignments = await listAssignmentsForWeek(week.id);
  const primaryAssignment = assignments[0] ?? null;
  if (!primaryAssignment) redirect("/lessons");

  return (
    <div className="py-2">
      <AssignmentWorkSection
        assignmentId={primaryAssignment.id}
        error={sp.error}
        submitted={sp.submitted === "1"}
        edit={sp.edit === "1"}
        step={sp.step ? Number(sp.step) : undefined}
      />
    </div>
  );
}
