import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllCourses, getCourse, youtubeThumbnail } from "@/lib/courses";
import { ResourceLink } from "@/components/courses/ResourceLink";

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
    <div className="min-h-screen bg-muted/10">
      <div className="container py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-8 mb-8">
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

            {course.resources && course.resources.length > 0 && (
              <div className="flex flex-col gap-4 mb-8">
                {course.resources.map((resource) => (
                  <ResourceLink key={resource.href} resource={resource} />
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6">
            {course.lessons.map((lesson) => {
              const colab = lesson.resources?.find((r) => r.type === "colab");
              return (
                <Link
                  key={lesson.id}
                  href={`/courses/${course.slug}/${lesson.id}`}
                  className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-4 flex gap-6"
                >
                  {lesson.videoId && (
                    <div className="relative w-64 h-36 flex-shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={youtubeThumbnail(lesson.videoId)}
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      {lesson.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-white text-sm">
                          {lesson.duration}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">{lesson.title}</h2>
                    <p className="text-muted-foreground">{lesson.summary}</p>
                    {colab && (
                      <div className="mt-4">
                        <ResourceLink resource={colab} size="sm" />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
