import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCourses, getLesson } from "@site/lib/courses";
import { getLessonTabs } from "@site/lib/courses/content";
import { LessonView } from "@site/components/courses/LessonView";

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

  return <LessonView course={course} lesson={lesson} tabs={tabs} />;
}
