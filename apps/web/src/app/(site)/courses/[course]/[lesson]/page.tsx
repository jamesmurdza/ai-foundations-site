import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCourses, getLesson } from "@site/lib/courses";
import { getLessonTabs } from "@site/lib/courses/content";
import { LessonView } from "@site/components/courses/LessonView";
import { Section } from "@site/components/section";
import { BackLink } from "@site/components/courses/BackLink";

export function generateStaticParams() {
  return getAllCourses().flatMap((course) =>
    course.lessons.map((lesson) => ({
      course: course.slug,
      lesson: lesson.id,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>;
}): Promise<Metadata> {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const result = getLesson(courseSlug, lessonSlug);
  if (!result) return {};
  const { course, lesson } = result;
  return {
    title: `${lesson.title} | ${course.title}`,
    description: lesson.summary ?? course.description,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>;
}) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const result = getLesson(courseSlug, lessonSlug);
  if (!result) notFound();
  const { course, lesson } = result;
  const tabs = getLessonTabs(course.slug, lesson);

  return (
    <Section className="mt-10 flex flex-col gap-8 pt-8">
      <BackLink href={`/courses/${course.slug}`} label="Back to Course" />
      <LessonView course={course} lesson={lesson} tabs={tabs} />
    </Section>
  );
}
