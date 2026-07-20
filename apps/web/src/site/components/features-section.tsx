import { FeatureCard } from "@site/components/feature-card";
import { Section } from "@site/components/section";
import { getAllCourses } from "@site/lib/courses";
import Link from "next/link";

export function Features() {
  const courses = getAllCourses();

  return (
    <Section
      id="courses"
      outerClassName="relative bg-background"
      className="flex flex-col gap-16"
    >
      <div className="flex w-full flex-col lg:flex-row lg:items-end justify-between gap-8">
            <h2 className="font-heading tracking-tight sm:text-4xl text-2xl text-balance font-semibold text-left shrink-0">
              Online courses
            </h2>
            <p className="text-xl text-muted-foreground flex-1 lg:text-right">
              We teach free courses to the public.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 grid-cols-1">
            {courses.map((course) => (
              <Link
                key={course.slug}
                href={`/courses/${course.slug}`}
                className="block h-full"
              >
                <FeatureCard
                  image={course.thumbnail}
                  title={course.shortTitle ?? course.title}
                />
              </Link>
            ))}
          </div>
    </Section>
  );
}
