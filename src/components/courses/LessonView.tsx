"use client";
import { useRef } from "react";
import type { Course, Lesson } from "@/lib/courses";
import { lessonHasTranscript } from "@/lib/courses";
import { Transcript } from "@/components/Transcript";
import { ResourceLink } from "@/components/courses/ResourceLink";

export function LessonView({ course, lesson }: { course: Course; lesson: Lesson }) {
  const playerRef = useRef<HTMLIFrameElement>(null);

  const handleSeek = (seconds: number) => {
    playerRef.current?.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: "seekTo",
        args: [seconds, true],
      }),
      "*",
    );
  };

  const resources =
    lesson.resources && lesson.resources.length > 0 ? lesson.resources : (course.resources ?? []);

  const showTranscript = Boolean(lesson.videoId) && lessonHasTranscript(lesson);

  return (
    <div className="bg-white rounded-xl border shadow-sm p-8">
      <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          {lesson.videoId && (
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden mb-8 lg:mb-0">
              <iframe
                ref={playerRef}
                src={`https://www.youtube.com/embed/${lesson.videoId}?enablejsapi=1`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
                style={{ border: 0 }}
              />
            </div>
          )}

          <div className="prose prose-zinc max-w-none mt-8">
            {lesson.description && (
              <>
                <h2 className="text-2xl font-semibold mb-4">About this lesson</h2>
                <p className="text-lg text-muted-foreground mb-8">{lesson.description}</p>
              </>
            )}

            {resources.length > 0 && (
              <div className="flex flex-col gap-4">
                {resources.map((resource) => (
                  <ResourceLink key={resource.href} resource={resource} />
                ))}
              </div>
            )}
          </div>
        </div>

        {showTranscript && lesson.videoId && (
          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0">
            <Transcript videoId={lesson.videoId} onSeek={handleSeek} />
          </div>
        )}
      </div>
    </div>
  );
}
