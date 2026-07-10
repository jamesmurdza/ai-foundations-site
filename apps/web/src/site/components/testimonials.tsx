import { TestimonialCard } from "@site/components/testimonial-card";
import { Section } from "@site/components/section";

export function Testimonials() {
  return (
    <Section outerClassName="bg-muted/10" className="flex flex-col items-center gap-16">
        <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
          <h2 className="font-heading tracking-tight sm:text-4xl text-2xl text-balance font-semibold">
            What people say
          </h2>
          <p className="text-xl text-muted-foreground">
            Experiences from past students and participants
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
    </Section>
  );
}
