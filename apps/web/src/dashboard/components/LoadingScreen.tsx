// Generic loading state for dashboard route transitions. Replaces the old
// skeleton that omitted the map/charts and never matched the real page — a
// single honest spinner can't mismatch. Paired with the top NavProgress bar for
// immediate click feedback.
export function LoadingScreen() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-hairline border-t-ink" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
