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
            name="John"
            text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec ultrices orci. Vivamus ante arcu, hendrerit."
            image="/images/testimonial-1.avif"
            username="johndoe"
          />
          <TestimonialCard
            name="Max"
            text="Mauris tincidunt porttitor risus, et posuere erat malesuada eu. Praesent volutpat ut ipsum."
            image="/images/testimonial-2.avif"
            username="maxcook"
          />
          <TestimonialCard
            name="Nicolas"
            text="Mauris tincidunt porttitor risus, et posuere erat malesuada eu. Praesent volutpat ut ipsum."
            image="/images/avatar10.avif"
            username="nicolashorn"
          />
          <TestimonialCard
            name="Leio"
            text="Curabitur at quam eget eros semper euismod vitae at neque. Ut ultrices ut tortor et feugiat. Etiam vitae nisi eleifend, blandit ligula quis, sodales neque."
            image="/images/avatr12.avif"
            username="leiomclaren"
          />
          <TestimonialCard
            name="Emily"
            text="Suspendisse a velit elit. Curabitur augue libero, vulputate sed dui id, sodales venenatis sem. Suspendisse dapibus neque eu justo volutpat gravida."
            image="/images/testimonial-4.avif"
            username="emilysmith"
          />
          <TestimonialCard
            name="Tim"
            text="Suspendisse a velit elit. Curabitur augue libero, vulputate sed dui id, sodales venenatis sem."
            image="/images/avatar11.avif"
            username="timturner"
          />
          <TestimonialCard
            name="Micheal"
            text="Vivamus dignissim porta orci, finibus tempus risus consectetur dapibus. Donec quis ornare elit. Curabitur tempor."
            image="/images/testimonial-5.avif"
            username="michael"
          />
          <TestimonialCard
            name="Jorge"
            text="Vivamus dignissim porta orci, finibus tempus risus consectetur dapibus. "
            image="/images/avatar9.avif"
            username="jojorge"
          />
          <TestimonialCard
            name="Linda"
            text="Nullam non lorem vitae risus volutpat dictum non sed magna. Aliquam in venenatis quam. Morbi feugiat tristique leo, vel ultrices dolor varius non."
            image="/images/testimonial-6.avif"
            username="thisislinda"
          />
          <TestimonialCard
            name="Miro"
            text="It's a great series. I appreciate the format. Interactive small group learning seems to keep the speaker grounded and focused on the subject. Thanks!"
            image="/images/default-avatar.png"
            username="mirodj"
          />
          <TestimonialCard
            name="Pattern Trader"
            text="Great initiative James. Look forward to the next class. I am myself a student of M Tech in AI & DS and it's always refreshing to see AI in various perspectives. This only reinforces the learning!"
            image="/images/default-avatar.png"
            username="patterntrader"
          />
        </div>
      </div>
    </section>
  );
}
