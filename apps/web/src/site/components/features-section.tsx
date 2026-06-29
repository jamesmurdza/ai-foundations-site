import { FeatureCard } from "@site/components/feature-card";
import Link from "next/link";

export function Features() {
  return (
    <section className="relative bg-background" id="courses">
      <div className="container">
        <div className="border-x border-t mt-28 flex flex-col gap-16 px-6 md:px-12 pt-12 pb-12">
        <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
          <h2 className="font-heading tracking-tight sm:text-4xl text-2xl text-balance font-semibold">
            Our courses
          </h2>
          <p className="text-xl text-muted-foreground">
            We teach free courses to the public, online and in person.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 grid-cols-1">
          <Link href="/courses/ml-python" className="block h-full">
            <FeatureCard
              image="/images/machinelearning.png"
              title="Machine Learning Fundamentals"
            />
          </Link>
          <Link href="/courses/ai-agent-camp" className="block h-full">
            <FeatureCard
              image="/images/python.png"
              title="AI Agents in Python"
            />
          </Link>
          <Link href="/courses/ai-agent-camp-nocode" className="block h-full">
            <FeatureCard
              image="/images/nocode.png"
              title="AI Automation with no code"
            />
          </Link>
          <Link href="/courses/minecraft-ai" className="block h-full">
            <FeatureCard
              image="/images/minecraft.png"
              title="Hacking Minecraft with AI"
            />
          </Link>
        </div>
        </div>
      </div>
    </section>
  );
}
