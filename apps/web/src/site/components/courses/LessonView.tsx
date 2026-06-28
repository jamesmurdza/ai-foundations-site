"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import type { Course, Lesson, ResolvedTab } from "@site/lib/courses";
import { Transcript } from "@site/components/Transcript";
import { Markdown } from "@site/components/Markdown";
import { ResourceLink } from "@site/components/courses/ResourceLink";

export function LessonView({
  course,
  lesson,
  tabs,
}: {
  course: Course;
  lesson: Lesson;
  tabs: ResolvedTab[];
}) {
  const playerRef = useRef<HTMLIFrameElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(0);

  // To close the lesson menu when clicking outside it or pressing Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // Seek the embedded YouTube player via the postMessage API.
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

  const active = tabs[activeTab];

  const renderTab = (tab: ResolvedTab) => {
    switch (tab.kind) {
      case "transcript":
        return lesson.videoId ? <Transcript videoId={lesson.videoId} onSeek={handleSeek} /> : null;
      case "material":
        return resources.length > 0 ? (
          <div className="flex flex-col gap-4">
            {resources.map((resource) => (
              <ResourceLink key={resource.href} resource={resource} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No materials for this lesson yet.</p>
        );
      case "markdown":
      default:
        return <Markdown>{tab.markdown ?? ""}</Markdown>;
    }
  };

  return (
    <div className="bg-white p-5 sm:rounded-xl sm:border sm:shadow-sm sm:p-6 md:p-8">
      {/* Sticky header: title, video and tab bar stay pinned while the panel scrolls. */}
      <div className="sticky top-0 z-30 -mx-5 sm:-mx-6 md:-mx-8 -mt-5 sm:-mt-6 md:-mt-8 px-5 sm:px-6 md:px-8 pt-5 sm:pt-6 md:pt-8 pb-4 bg-white sm:rounded-t-xl">
        <div ref={menuRef} className="relative z-40 mb-6 inline-block">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            className="group flex items-center gap-2 text-left rounded-lg -mx-2 px-2 py-1 hover:bg-slate-50 transition-colors"
          >
            <h1 className="text-lg sm:text-xl font-bold">{lesson.title}</h1>
            <ChevronDown
              className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen && (
            <div className="absolute z-40 mt-2 w-[min(28rem,calc(100vw-4rem))] max-h-[60vh] overflow-y-auto rounded-xl border bg-white p-2 shadow-lg">
              {course.lessons.map((l, idx) => {
                const isCurrent = l.id === lesson.id;
                return (
                  <Link
                    key={l.id}
                    href={`/courses/${course.slug}/${l.id}`}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`flex items-start gap-3 rounded-lg px-3 py-2 transition-colors ${
                      isCurrent ? "bg-slate-100" : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="mt-0.5 w-5 shrink-0 text-sm text-muted-foreground tabular-nums">
                      {isCurrent ? <Check className="w-4 h-4 text-primary" /> : idx + 1}
                    </span>
                    <span className={`text-sm leading-snug ${isCurrent ? "font-semibold" : ""}`}>
                      {l.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {lesson.videoId && (
          <div className="aspect-video w-full max-w-[calc(55vh*16/9)] mx-auto bg-black rounded-lg overflow-hidden">
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

        {tabs.length > 1 && (
          <div
            role="tablist"
            aria-label="Lesson sections"
            className="flex gap-1 overflow-x-auto overflow-y-hidden border-b mt-4"
          >
            {tabs.map((tab, idx) => {
              const isActive = idx === activeTab;
              return (
                <button
                  key={`${tab.type}-${idx}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(idx)}
                  className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {active && (
        <div role="tabpanel" className="min-h-[8rem] pt-2">
          {renderTab(active)}
        </div>
      )}
    </div>
  );
}
