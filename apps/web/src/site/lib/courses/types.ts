export type ResourceType = "colab" | "github" | "apply" | "link";

export interface Resource {
  type: ResourceType;
  label: string;
  href: string;
}

// A tab declared on a lesson. `type` picks the renderer + default label:
//   "material"   -> renders the lesson/course resources
//   "transcript" -> renders the video transcript
//   anything else (e.g. "about", "notes", "exercises") -> renders markdown.
//   Short markdown can live inline via `content`; longer markdown is read from
//   content/courses/<courseSlug>/<lessonId>/<file ?? `${type}.md`>. `content`
//   takes precedence over the file when both are present.
export interface LessonTab {
  type: string;
  label?: string;
  file?: string;
  content?: string;
}

// A tab after the server has resolved its content, ready for the client.
export interface ResolvedTab {
  type: string;
  label: string;
  kind: "markdown" | "material" | "transcript";
  markdown?: string;
}

export interface Lesson {
  id: string;
  title: string;
  summary?: string;
  videoId?: string;
  duration?: string;
  hasTranscript?: boolean;
  resources?: Resource[];
  tabs?: LessonTab[];
}

export interface Course {
  slug: string;
  title: string;
  shortTitle?: string;
  thumbnail: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  resources?: Resource[];
  lessons: Lesson[];
}
