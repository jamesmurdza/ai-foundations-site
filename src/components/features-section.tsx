import { FeatureCard } from "@/components/feature-card";

export function Features() {
  return (
    <section className="relative bg-background py-20">
      <div className="container mx-auto flex flex-col gap-12">
        <div className="flex justify-between w-full flex-col lg:flex-row gap-4 lg:items-end">
          <h2 className="font-heading tracking-tight sm:text-5xl text-3xl text-balance font-semibold text-left flex-1">
            Our courses
          </h2>
          <p className="text-lg text-muted-foreground flex-1">
            We teach free courses to the public, online and in person.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 grid-cols-1">
          <FeatureCard
            image="/images/filters.png"
            title="Machine Learning"
          />
          <FeatureCard
            image="/images/calendar.png"
            title="AI Agent Camp (Python)"
          />
          <FeatureCard
            image="/images/notification.png"
            title="AI Agent Camp (No code)"
          />
        </div>
      </div>
    </section>
  );
}
