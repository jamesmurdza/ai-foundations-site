import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCourses, getCourse } from "@site/lib/courses";
import { ResourceLink } from "@site/components/courses/ResourceLink";
import { Section } from "@site/components/section";
import { BackLink } from "@site/components/courses/BackLink";
import { LessonCard } from "@site/components/courses/LessonCard";

export function generateStaticParams() {
  return getAllCourses().map((course) => ({ course: course.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string }>;
}): Promise<Metadata> {
  const { course: courseSlug } = await params;
  const course = getCourse(courseSlug);
  if (!course) return {};
  return {
    title: course.metaTitle ?? course.title,
    description: course.metaDescription ?? course.description,
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course: courseSlug } = await params;
  const course = getCourse(courseSlug);
  if (!course) notFound();

  return (
    <>
      <Section className="mt-10 flex flex-col gap-6 pt-8">
        <BackLink href="/#courses" label="Back to Courses" />
        <div className="flex flex-col gap-4">
          <h1 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            {course.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {course.description}
          </p>
          {course.resources && course.resources.length > 0 && (
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
              {course.resources.map((resource) => (
                <ResourceLink key={resource.href} resource={resource} />
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section className="flex flex-col gap-16">
        <h2 className="font-heading text-2xl sm:text-4xl font-semibold tracking-tight">
          Course lessons
        </h2>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {course.lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              courseSlug={course.slug}
              index={index}
            />
          ))}
        </div>
      </Section>
    </>
  );
}
