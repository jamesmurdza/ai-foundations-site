import type { Course, Lesson } from "./types";
import { aiAgentCamp } from "./ai-agent-camp";
import { mlPython } from "./ml-python";
import { minecraftAi } from "./minecraft-ai";

export type {
  Course,
  Lesson,
  LessonTab,
  ResolvedTab,
  Resource,
  ResourceType,
} from "./types";

const COURSES: Course[] = [mlPython, aiAgentCamp, minecraftAi];

export function getAllCourses(): Course[] {
  return COURSES;
}

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function getLesson(
  slug: string,
  lessonId: string,
): { course: Course; lesson: Lesson } | undefined {
  const course = getCourse(slug);
  const lesson = course?.lessons.find((l) => l.id === lessonId);
  if (!course || !lesson) return undefined;
  return { course, lesson };
}

export function youtubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function lessonHasTranscript(lesson: Lesson): boolean {
  if (lesson.hasTranscript !== undefined) return lesson.hasTranscript;
  return Boolean(lesson.videoId);
}
