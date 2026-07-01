// Content skeleton for the admin console. Rendered inside the admin layout, so
// the "Organizer console" header and the AdminTabs stay put while the active
// tab's data streams in — navigation between admin tabs feels instant.
export default function AdminLoading() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="h-4 w-40 rounded bg-ice-tint mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-ice-tint shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-ice-tint" />
              <div className="h-3 w-1/2 rounded bg-ice-tint" />
            </div>
            <div className="h-8 w-20 rounded-md bg-ice-tint shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
