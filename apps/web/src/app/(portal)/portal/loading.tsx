// Portal-wide loading boundary. This is the fallback for every /portal/* route
// that doesn't declare a closer one (profiles, users, weeks, assignments,
// onboarding, map, showcase, stars, pulse, application, the portal index…). The
// (app) group and demo-day override it with their own skeletons.
//
// Beyond the instant feedback, a loading boundary is what lets <Link> prefetch
// the static shell of these force-dynamic routes: without it, clicking a link
// fires a cold RSC request that blocks on auth + the full server render before
// anything paints — the perceived "delay after clicking."
export default function PortalLoading() {
  return (
    <div className="container-page py-8 animate-pulse" aria-hidden>
      <div className="h-9 w-56 max-w-full rounded-lg bg-ice-tint mb-3" />
      <div className="h-4 w-80 max-w-full rounded bg-ice-tint mb-8" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card">
            <div className="h-4 w-2/3 rounded bg-ice-tint" />
            <div className="h-3 w-1/2 rounded bg-ice-tint mt-3" />
            <div className="h-3 w-full rounded bg-ice-tint mt-5" />
            <div className="h-3 w-4/5 rounded bg-ice-tint mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
