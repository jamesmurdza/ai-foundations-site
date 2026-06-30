import { redirect, notFound } from "@portal/lib/nav";
import {
  getAssignment,
  getWeek,
  getAssignmentForWeekNumber,
} from "@portal/lib/queries";
import {
  parseWeekRouteParam,
  weekAssignmentHomePath,
} from "@portal/lib/weekRoutes";

// Legacy /assignments/* URLs redirect to the homepage assignment section.
export default async function AssignmentRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const weekNumber = parseWeekRouteParam(id);
  if (weekNumber) {
    const row = await getAssignmentForWeekNumber(weekNumber);
    if (!row) notFound();
    redirect(weekAssignmentHomePath(row.week.id));
  }

  const assignment = await getAssignment(id);
  if (!assignment) notFound();

  const week = await getWeek(assignment.weekId);
  if (!week) notFound();

  redirect(weekAssignmentHomePath(week.id));
}
