import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAllCourses, getLesson } from "@site/lib/courses";
import { getLessonTabs } from "@site/lib/courses/content";
import { LessonView } from "@site/components/courses/LessonView";
import { Header } from "@site/components/header";
import { Footer } from "@site/components/footer";

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
    <div className="min-h-screen bg-background">
      <Header />
      <section>
        <div className="container">
          <div className="border-x border-t mt-10 flex flex-col gap-8 px-6 md:px-12 pt-8 pb-12">
            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Course
            </Link>

            <LessonView course={course} lesson={lesson} tabs={tabs} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
