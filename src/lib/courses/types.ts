export type ResourceType = "colab" | "github" | "apply" | "link";

export interface Resource {
  type: ResourceType;
  label: string;
  href: string;
}

export interface Lesson {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  videoId?: string;
  duration?: string;
  hasTranscript?: boolean;
  notes?: string;
  resources?: Resource[];
}

export interface Course {
  slug: string;
  title: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  resources?: Resource[];
  lessons: Lesson[];
}
