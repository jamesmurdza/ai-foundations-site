export function Field({
  label,
  children,
  hint,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="meta-light text-[12px] mt-1">{hint}</p>}
    </div>
  );
}

export function SectionCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card !p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-[20px] font-bold">{title}</h2>
        {desc && <p className="meta text-[14px] mt-1">{desc}</p>}
      </div>
      {children}
    </section>
  );
}
