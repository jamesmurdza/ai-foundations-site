import { TestimonialCard } from "@site/components/testimonial-card";

export function Testimonials() {
  return (
    <section className="py-24 bg-muted/10">
      <div className="container flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-4 max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            What people say about us
          </h2>
          <p className="text-muted-foreground text-lg">
            Outcomes from students in our learning community
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          <TestimonialCard
            name="Ross"
            text="James is a patient tutor who breaks code down so it actually clicks. Highly recommend!"
            image="/images/ross.avif"
            username="Student"
          />
          <TestimonialCard
            name="Adithyakarthik"
            text="Exactly what students need — most guides throw too much at once. This keeps it simple."
            image="/images/Adityha.avif"
            username="captainion"
          />
          <TestimonialCard
            name="Pattern Trader"
            text="Great initiative, James. As an M.Tech AI & DS student, it's refreshing to see AI from new angles."
            image="/images/default-avatar.png"
            username="patterntrader"
          />
        </div>
      </div>
    </section>
  );
}
