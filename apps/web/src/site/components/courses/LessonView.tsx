"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Course, Lesson, ResolvedTab } from "@site/lib/courses";
import { Transcript } from "@site/components/Transcript";
import { Markdown } from "@site/components/Markdown";
import { ResourceLink } from "@site/components/courses/ResourceLink";

interface YTPlayer {
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  destroy: () => void;
}
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

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
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  // Current playback time (seconds)
  const [currentTime, setCurrentTime] = useState(0);

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

  // Attach the YouTube Player API to the iframe and poll the current time so
  // the transcript can follow along with playback.
  useEffect(() => {
    if (!lesson.videoId) return;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    loadYouTubeApi().then(() => {
      if (cancelled || !playerRef.current || !window.YT?.Player) return;
      const player = new window.YT.Player(playerRef.current, {});
      ytPlayerRef.current = player;
      interval = setInterval(() => {
        if (typeof player.getCurrentTime === "function") {
          setCurrentTime(player.getCurrentTime() || 0);
        }
      }, 250);
    });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      ytPlayerRef.current?.destroy?.();
      ytPlayerRef.current = null;
    };
  }, [lesson.videoId]);

  const handleSeek = (seconds: number) => {
    const player = ytPlayerRef.current;
    if (player && typeof player.seekTo === "function") {
      player.seekTo(seconds, true);
      player.playVideo?.();
      return;
    }
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
    lesson.resources && lesson.resources.length > 0
      ? lesson.resources
      : (course.resources ?? []);

  const contentTabs = tabs.filter((t) => {
    if (t.kind === "transcript") return false;
    if (t.kind === "material" && resources.length === 0) return false;
    return true;
  });
  const hasTranscript =
    tabs.some((t) => t.kind === "transcript") && Boolean(lesson.videoId);
  const active = contentTabs[activeTab];

  // Previous / next lesson for the bottom navigation.
  const currentIndex = course.lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson =
    currentIndex > 0 ? course.lessons[currentIndex - 1] : undefined;
  const nextLesson =
    currentIndex >= 0 && currentIndex < course.lessons.length - 1
      ? course.lessons[currentIndex + 1]
      : undefined;

  const renderTab = (tab: ResolvedTab) => {
    switch (tab.kind) {
      case "transcript":
        return lesson.videoId ? (
          <Transcript videoId={lesson.videoId} onSeek={handleSeek} />
        ) : null;
      case "material":
        return resources.length > 0 ? (
          <div className="flex flex-col gap-4">
            {resources.map((resource) => (
              <ResourceLink key={resource.href} resource={resource} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No materials for this lesson yet.
          </p>
        );
      case "markdown":
      default:
        return <Markdown>{tab.markdown ?? ""}</Markdown>;
    }
  };

  return (
    <div className="bg-white p-5 sm:rounded-xl sm:border sm:shadow-sm sm:p-6 md:p-8">
      <div>
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
                      {isCurrent ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <span
                      className={`text-sm leading-snug ${isCurrent ? "font-semibold" : ""}`}
                    >
                      {l.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {lesson.videoId && (
          <div className="flex flex-col md:flex-row md:items-stretch gap-4 lg:gap-6">
            <div className="flex-1 min-w-0">
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
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
            </div>
            {hasTranscript && (
              <div className="w-full shrink-0 md:relative md:w-[300px] lg:w-[360px] xl:w-[440px]">
                <Transcript
                  videoId={lesson.videoId}
                  onSeek={handleSeek}
                  currentTime={currentTime}
                />
              </div>
            )}
          </div>
        )}

        {contentTabs.length > 1 && (
          <div
            role="tablist"
            aria-label="Lesson sections"
            className="flex gap-1 overflow-x-auto overflow-y-hidden border-b mt-6"
          >
            {contentTabs.map((tab, idx) => {
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

      {(prevLesson || nextLesson) && (
        <nav
          aria-label="Lesson navigation"
          className="mt-8 flex items-center justify-between gap-3 border-t pt-6"
        >
          {prevLesson ? (
            <Link
              href={`/courses/${course.slug}/${prevLesson.id}`}
              className="group flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-slate-50 sm:max-w-[20rem]"
            >
              <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
              <span className="text-sm font-medium sm:hidden">Back</span>
              <span className="hidden min-w-0 sm:block">
                <span className="block text-xs text-muted-foreground">
                  Previous
                </span>
                <span className="block truncate text-sm font-medium">
                  {prevLesson.title}
                </span>
              </span>
            </Link>
          ) : (
            <span aria-hidden />
          )}

          {nextLesson && (
            <Link
              href={`/courses/${course.slug}/${nextLesson.id}`}
              className="group flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-slate-50 sm:max-w-[20rem] sm:justify-end sm:text-right"
            >
              <span className="text-sm font-medium sm:hidden">Next</span>
              <span className="hidden min-w-0 sm:block">
                <span className="block text-xs text-muted-foreground">
                  Next
                </span>
                <span className="block truncate text-sm font-medium">
                  {nextLesson.title}
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
