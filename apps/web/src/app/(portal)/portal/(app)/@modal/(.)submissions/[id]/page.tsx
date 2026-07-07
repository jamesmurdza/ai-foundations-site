import { Suspense } from "react";
import { SubmissionModal } from "@portal/components/SubmissionModal";
import { SubmissionDetailView } from "@portal/components/SubmissionDetailView";
import { LoadingScreen } from "@portal/components/LoadingScreen";
import { parseWeekRouteParam } from "@portal/lib/weekRoutes";
import { redirect } from "@portal/lib/nav";

// Intercepting route: on a soft navigation to /submissions/[id] from anywhere
// under the signed-in shell (Your Work, Discover), render the submission in an
// Instagram-style modal over the current page instead of a full page load.
export default async function SubmissionModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Week-route params (e.g. "week-3") are assignment shortcuts, not submissions —
  // send those to the full page, which resolves the redirect.
  if (parseWeekRouteParam(id)) redirect(`/submissions/${id}`);

  // Render the modal chrome immediately and stream the (data-heavy) detail in
  // behind a Suspense boundary, so a click shows the modal with a spinner right
  // away instead of nothing until everything has loaded.
  return (
    <SubmissionModal>
      <Suspense fallback={<LoadingScreen />}>
        <SubmissionDetailView id={id} />
      </Suspense>
    </SubmissionModal>
  );
}
