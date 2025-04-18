import { FeatureCard } from "@/components/feature-card";
import Link from "next/link";

export function Features() {
  return (
    <section className="relative bg-background py-20" id="courses">
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
          <Link href="/courses/ml-python" className="block">
            <FeatureCard
              image="/images/filters.png"
              title="Machine Learning"
            />
          </Link>
          <Link href="/courses/ai-agent-camp" className="block">
            <FeatureCard
              image="/images/calendar.png"
              title="AI Agent Camp (Python)"
            />
          </Link>
          <Link href="/courses/ai-agent-camp-nocode" className="block">
            <FeatureCard
              image="/images/notification.png"
              title="AI Agent Camp (No code)"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
