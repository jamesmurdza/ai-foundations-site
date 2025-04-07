import { FeatureCard } from "@/components/feature-card";

export function Features() {
  return (
    <section className="relative bg-background py-20">
      <div className="container mx-auto flex flex-col gap-12">
        <div className="flex justify-between w-full flex-col lg:flex-row gap-4 lg:items-end">
          <h2 className="font-heading tracking-tight sm:text-5xl text-3xl text-balance font-semibold text-left flex-1">
            Made for modern product teams
          </h2>
          <p className="text-lg text-muted-foreground flex-1">
            Our analytics platform is built on the strategies and insights that empower leading
            data-driven teams: deep visibility, real-time intelligence, and a dedication to
            continuous improvement.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 grid-cols-1">
          <FeatureCard
            image="/images/filters.png"
            title="Designed for real-time helpful data insights"
          />
          <FeatureCard
            image="/images/calendar.png"
            title="Optimized for fast and flexible scheduling"
          />
          <FeatureCard
            image="/images/notification.png"
            title="Built for seamless team collaboration"
          />
        </div>
      </div>
    </section>
  );
}
