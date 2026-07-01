// Loading skeleton for the admin dashboard (application list + detail views).
// Rendered inside AdminShell's <main>, so the top bar stays put. The boundary
// also gives <Link> a static shell to prefetch for these force-dynamic routes,
// so navigating into an application no longer blocks on a cold server render.
export default function DashboardLoading() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="h-7 w-52 max-w-full rounded-lg bg-hairline mb-6" />
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-pill bg-hairline" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-md border border-hairline/80 p-4"
          >
            <div className="h-9 w-9 rounded-full bg-hairline shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 rounded bg-hairline" />
              <div className="h-3 w-1/2 rounded bg-hairline" />
            </div>
            <div className="h-6 w-16 rounded-pill bg-hairline shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
