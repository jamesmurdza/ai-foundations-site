// Generic loading state for portal route transitions. This replaces the old
// per-page skeletons: rather than guessing a layout that often mismatched the
// real content, it shows one honest, centered spinner. Paired with the top
// NavProgress bar, a click always produces immediate, correct feedback.
export function LoadingScreen() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ice-tint border-t-signal-blue" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
