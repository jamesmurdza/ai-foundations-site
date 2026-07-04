import Link from "@portal/components/Link";

/**
 * Week 0 — a short, informational welcome. No assignment or submission: it just
 * explains what AI Summer School is and what the four weeks look like, then
 * points the participant at Week 1.
 */
export function WelcomeWeek({ nextWeekHref }: { nextWeekHref: string }) {
  return (
    <section className="max-w-[720px]">
      <p className="text-[13px] font-medium text-slate-channel/60 mb-0.5">
        Week 0: Welcome
      </p>
      <h1 className="text-[30px] md:text-[34px] font-semibold leading-tight">
        Welcome to AI Summer School 👋
      </h1>

      <p className="mt-4 text-[16px] leading-relaxed">
        AI Summer School is a four-week program where you learn by building real
        projects — one each week, alongside a cohort doing the same.
      </p>

      <h2 className="mt-8 text-[20px] font-semibold">What to expect</h2>
      <p className="mt-2 text-[15px] leading-relaxed">
        Every week is a short guided flow: a bit of context, a hands-on
        assignment you submit, and feedback — from an AI reviewer and from your
        peers. Here&apos;s the arc:
      </p>
      <ul className="mt-4 space-y-1.5 list-disc pl-5 text-[15px] leading-relaxed">
        <li>Week 1 — Refresh your GitHub profile and README</li>
        <li>Week 2 — Showcase a project for the cohort to star</li>
        <li>Week 3 — Make an open-source contribution</li>
        <li>Week 4 — Build your portfolio and find your direction</li>
      </ul>

      <p className="mt-6 text-[15px] leading-relaxed">
        Along the way there are weekly livestreams, a showcase where the cohort
        stars each other&apos;s work, and plenty of feedback. Come as you are —
        the most important thing is that it feels like you.
      </p>

      <div className="mt-8">
        <Link href={nextWeekHref} className="btn btn-primary">
          Start Week 1 →
        </Link>
      </div>
    </section>
  );
}
