import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllCourses, getLesson } from "@/lib/courses";
import { LessonView } from "@/components/courses/LessonView";

export function generateStaticParams() {
  return getAllCourses().flatMap((course) =>
    course.lessons.map((lesson) => ({
      course: course.slug,
      lesson: lesson.id,
    })),
  );
}

export function generateMetadata({
  params,
}: {
  params: { course: string; lesson: string };
}): Metadata {
  const result = getLesson(params.course, params.lesson);
  if (!result) return {};
  const { course, lesson } = result;
  return {
    title: `${lesson.title} | ${course.title}`,
    description: lesson.summary ?? lesson.description ?? course.description,
  };
}

export default function LessonPage({ params }: { params: { course: string; lesson: string } }) {
  const result = getLesson(params.course, params.lesson);
  if (!result) notFound();
  const { course, lesson } = result;

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href={`/courses/${course.slug}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Button>
            </Link>
          </div>

          <LessonView course={course} lesson={lesson} />
        </div>
      </div>
    </div>
  );
}
