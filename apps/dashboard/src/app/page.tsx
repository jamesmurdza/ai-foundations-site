import { headers } from "next/headers";

import { ApplicantsView } from "@/components/ApplicantsView";
import { SubmissionsChart } from "@/components/SubmissionsChart";
import { WorldMap } from "@/components/WorldMap";
import { getCounts, listApplications } from "@/lib/applications";
import { getCommentCounts, getDailySubmissions, getUnreadFor } from "@/lib/comments";
import { countryOf } from "@/lib/geo";
import { getStars } from "@/lib/stars";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const h = await headers();
  const me = h.get("x-admin-user") ?? "admin";

  const [counts, allApps, dailyPoints, unread, commentCounts, stars] = await Promise.all([
    getCounts(),
    listApplications(),
    getDailySubmissions(30),
    getUnreadFor(me),
    getCommentCounts(),
    getStars(),
  ]);

  const countryCounts = new Map<string, number>();
  for (const a of allApps) {
    const c = countryOf(a.answers);
    if (!c) continue;
    countryCounts.set(c, (countryCounts.get(c) ?? 0) + 1);
  }

  const fetchedAt = new Date().toISOString();

  return (
    <>
      <header className="mb-8 md:mb-10 flex flex-col gap-2">
        <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.18em] text-ink-48">
          Applications
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
          <h1 className="text-[30px] sm:text-[36px] md:text-[40px] font-semibold leading-tight tracking-[-0.022em] text-ink">
            {counts.total} {counts.total === 1 ? "application" : "applications"}
          </h1>
          <a
            href="/api/export"
            className="inline-flex h-10 md:h-11 items-center rounded-full bg-action px-5 md:px-6 text-[14px] md:text-[15px] font-medium text-white transition-transform active:scale-[0.97] hover:bg-action-focus"
          >
            Export CSV
          </a>
        </div>
      </header>

      <section className="mb-6">
        <WorldMap counts={countryCounts} />
      </section>

      <section className="mb-8">
        <SubmissionsChart points={dailyPoints} />
      </section>

      <section className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Submitted" value={counts.submitted} muted={counts.submitted === 0} />
        <StatCard label="In progress" value={counts.inProgress} highlight={counts.inProgress > 0} />
        <StatCard label="Accepted" value={counts.accepted} accent="emerald" />
        <StatCard label="Rejected" value={counts.rejected} muted={counts.rejected === 0} />
      </section>

      <ApplicantsView
        initial={{ apps: allApps, unread, commentCounts, stars, me, fetchedAt }}
      />
    </>
  );
}

function StatCard({
  label,
  value,
  muted,
  highlight,
  accent,
}: {
  label: string;
  value: number;
  muted?: boolean;
  highlight?: boolean;
  accent?: "emerald";
}) {
  const valueCls = muted
    ? "text-ink-48"
    : accent === "emerald"
      ? "text-[#16a34a]"
      : highlight
        ? "text-ink"
        : "text-ink";
  return (
    <div className="rounded-[18px] border border-hairline bg-canvas px-5 py-5">
      <div className="text-[12px] uppercase tracking-[0.12em] text-ink-48">
        {label}
      </div>
      <div className={`mt-1 text-[34px] font-semibold tracking-tight ${valueCls}`}>
        {value}
      </div>
    </div>
  );
}
