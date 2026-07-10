import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAllCourses, getCourse, youtubeThumbnail } from "@site/lib/courses";
import { ResourceLink } from "@site/components/courses/ResourceLink";
import { Header } from "@site/components/header";

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
    <div className="min-h-screen bg-background">
      <Header />
      <section>
        <div className="container">
          {/* Breadcrumb / back link */}
          <div className="border-x border-t px-6 md:px-12 py-4">
            <Link
              href="/#courses"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </Link>
          </div>

          {/* Course header */}
          <div className="border-x border-t px-6 md:px-12 pt-12 pb-12 flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h1 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight text-balance">
                {course.title}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {course.description}
              </p>
            </div>

            {course.resources && course.resources.length > 0 && (
              <div className="flex flex-col gap-4">
                {course.resources.map((resource) => (
                  <ResourceLink key={resource.href} resource={resource} />
                ))}
              </div>
            )}
          </div>

          {/* Lessons */}
          <div className="border-x border-y divide-y">
            {course.lessons.map((lesson) => {
              const colab = lesson.resources?.find((r) => r.type === "colab");
              return (
                <Link
                  key={lesson.id}
                  href={`/courses/${course.slug}/${lesson.id}`}
                  className="group flex flex-col sm:flex-row gap-4 sm:gap-6 px-6 md:px-12 py-6 transition-colors hover:bg-muted/40"
                >
                  {lesson.videoId && (
                    <div className="relative w-full sm:w-64 aspect-video sm:aspect-auto sm:h-36 shrink-0 rounded-lg overflow-hidden border">
                      <img
                        src={youtubeThumbnail(lesson.videoId)}
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
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
                  <div className="flex-1 min-w-0">
                    <h2 className="font-heading text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {lesson.title}
                    </h2>
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
      </section>
    </div>
  );
}
