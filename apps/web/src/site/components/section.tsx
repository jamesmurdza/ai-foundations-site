import { cn } from "@site/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  /** Extra classes for the inner framed box. Overrides defaults via tailwind-merge. */
  className?: string;
  /** Extra classes for the outer <section> element. */
  outerClassName?: string;
  id?: string;
}

/**
 * A framed content section matching the site's editorial layout: a centered
 * container with border-x side rails, a top rail, and a generous top margin
 * that creates the vertical rhythm between stacked sections.
 */
export function Section({ children, className, outerClassName, id }: SectionProps) {
  return (
    <section id={id} className={outerClassName}>
      <div className="container">
        <div
          className={cn(
            "border-x border-t mt-28 px-6 md:px-12 pt-12 pb-12",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
