import { notFound } from "@portal/lib/nav";
import { requireOnboardedUser } from "@portal/lib/auth";
import { getWeek } from "@portal/lib/queries";
import { WeekBody } from "@portal/components/WeekBody";
import { WeekSteps } from "@portal/components/WeekSteps";

export default async function WeekPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, profile } = await requireOnboardedUser();
  const week = await getWeek(id);
  if (!week) notFound();

  return (
    <div className="container-page py-10">
      <div className="flex items-center gap-3 mb-1">
        <span className="badge badge-muted">Week {week.number}</span>
        {week.isLive && (
          <span className="badge badge-teal"><span className="live-dot" /> live now</span>
        )}
      </div>
      <h1 className="text-heading-lg">{week.theme}</h1>
      {week.description && <p className="meta mt-2 max-w-[70ch]">{week.description}</p>}

      <WeekSteps week={week} userId={user.id} profile={profile} />

      <div className="mt-10">
        <WeekBody week={week} userId={user.id} isAdmin={user.isAdmin} />
      </div>
    </div>
  );
}
