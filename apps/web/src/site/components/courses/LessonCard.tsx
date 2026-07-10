import Link from "next/link";
import type { Lesson } from "@site/lib/courses";
import { youtubeThumbnail } from "@site/lib/courses";

export function LessonCard({
  lesson,
  courseSlug,
  index,
}: {
  lesson: Lesson;
  courseSlug: string;
  index: number;
}) {
  return (
    <Link
      href={`/courses/${courseSlug}/${lesson.id}`}
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
        <h3 className="font-heading text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
          {lesson.title}
        </h3>
        {lesson.summary && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {lesson.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
