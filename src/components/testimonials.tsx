import { TestimonialCard } from "@/components/testimonial-card";

export function Testimonials() {
  return (
    <section className="py-24 bg-muted/10">
      <div className="container flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-4 max-w-2xl text-center">
          <span className="font-medium text-primary/90 bg-primary/10 px-4 py-1 rounded-full text-sm">
            Testimonials
          </span>
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
            text="James is a great tutor. Very patient and breaks code down to make it easier to understand. Highly recommend!"
            image="/images/ross.avif"
            username="Student"
          />
          <TestimonialCard
            name="Adithyakarthik"
            text="This is truly something many of the students need in my university, as currently existing guides aren't exactly simple to read and understand and throw a lot of knowledge at once, overwhelming the student, excited to see your idea up and running!"
            image="/images/Adityha.avif"
            username="captainion"
          />
          <TestimonialCard
            name="Ankur"
            text="I am doing my BE in Machine Learning, personally this will be super helpful."
            image="/images/ankur.avif"
            username="sandaankur"
          />
        </div>
      </div>
    </section>
  );
}
