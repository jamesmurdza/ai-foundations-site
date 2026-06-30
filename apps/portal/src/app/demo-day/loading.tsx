// Loading skeleton for the public Demo Day page (the long showcase grid).
export default function DemoDayLoading() {
  return (
    <div className="container-page py-12 animate-pulse" aria-hidden>
      <div className="h-10 w-64 max-w-full rounded-lg bg-ice-tint mx-auto mb-10" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card h-40" />
        ))}
      </div>
    </div>
  );
}
