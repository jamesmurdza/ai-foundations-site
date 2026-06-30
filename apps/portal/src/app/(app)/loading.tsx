// Loading skeleton for the signed-in app pages (home, submissions, discover…).
// Beyond the instant feedback, having a loading boundary lets Next partially
// prefetch these dynamic routes (layout → here) instead of nothing.
export default function AppLoading() {
  return (
    <div className="py-2 animate-pulse" aria-hidden>
      <div className="h-8 w-48 rounded-lg bg-ice-tint mb-3" />
      <div className="h-4 w-80 max-w-full rounded bg-ice-tint mb-8" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-ice-tint" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-ice-tint" />
                <div className="h-3 w-1/2 rounded bg-ice-tint" />
              </div>
            </div>
            <div className="h-3 w-full rounded bg-ice-tint mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
