import { notFound, redirect } from "@portal/lib/nav";
import { getAssignmentForWeekNumber } from "@portal/lib/queries";
import { SubmissionDetailView } from "@portal/components/SubmissionDetailView";
import { parseWeekRouteParam, weekAssignmentHomePath } from "@portal/lib/weekRoutes";

export default async function SubmissionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const weekNumber = parseWeekRouteParam(id);
  if (weekNumber) {
    const row = await getAssignmentForWeekNumber(weekNumber);
    if (!row) notFound();
    redirect(
      weekAssignmentHomePath(row.week.id, error ? { error } : undefined),
    );
  }

  return (
    <div className="py-2">
      <SubmissionDetailView id={id} />
    </div>
  );
}
