import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@site/components/ui/button";
import { getAllCourses, getLesson } from "@site/lib/courses";
import { getLessonTabs } from "@site/lib/courses/content";
import { LessonView } from "@site/components/courses/LessonView";
import { Header } from "@site/components/header";

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
    <div className="min-h-screen bg-muted/10">
      <Header />
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`mx-auto ${lesson.videoId ? "max-w-7xl" : "max-w-4xl"}`}
        >
          <div className="flex items-center gap-4 mb-8">
            <Link href={`/courses/${course.slug}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Button>
            </Link>
          </div>

          <LessonView course={course} lesson={lesson} tabs={tabs} />
        </div>
      </div>
    </div>
  );
}
