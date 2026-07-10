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

          {/* Course header + lessons */}
          <div className="border-x border-y flex flex-col gap-12 px-6 md:px-12 pt-12 pb-16">
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

            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {course.lessons.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  href={`/courses/${course.slug}/${lesson.id}`}
                  className="group flex flex-col"
                >
                  {lesson.videoId ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border bg-muted">
                      <img
                        src={youtubeThumbnail(lesson.videoId)}
                        alt={lesson.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 transition-transform group-hover:scale-110">
                          <svg
                            className="h-6 w-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      {lesson.duration && (
                        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-sm text-white">
                          {lesson.duration}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-2xl border bg-muted/40 transition-colors group-hover:bg-muted/70">
                      <span className="font-heading text-5xl font-semibold text-muted-foreground/30">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col gap-1.5">
                    <h2 className="font-heading text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
                      {lesson.title}
                    </h2>
                    {lesson.summary && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {lesson.summary}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
