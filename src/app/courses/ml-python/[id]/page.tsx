import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Machine Learning in Python",
  description: "Learn Machine Learning with Python through this comprehensive course",
};

const videos = {
  "1": {
    title: "Machine Learning in Python: Introduction",
    description: "Apply to join: https://aifoundations.school\nGitHub repository: https://github.com/aifoundations/course/",
    videoId: "uzKF08iaxu0",
    githubLink: "https://github.com/aifoundations/course/"
  },
  "2": {
    title: "AI Foundations: Linear Regression in Machine Learning",
    description: "Apply to join: https://aifoundations.school\nGitHub repository: https://github.com/aifoundations/course/",
    videoId: "OJTqB2wlvyA",
    githubLink: "https://github.com/aifoundations/course/"
  },
  "3": {
    title: "AI Foundations: Linear Regression Demo",
    description: "Join AI Foundations: https://aifoundations.school\nOpen source curriculum: https://github.com/aifoundations/course/",
    videoId: "t4agKQrQou4",
    githubLink: "https://github.com/aifoundations/course/"
  },
  "4": {
    title: "AI Foundations: Logistic Regression",
    description: "Join AI Foundations: https://aifoundations.school\nOpen source curriculum: https://github.com/aifoundations/course/",
    videoId: "RtDeNk00_FE",
    githubLink: "https://github.com/aifoundations/course/"
  },
  "5": {
    title: "AI Foundations: Would you survive the titanic disaster?",
    description: "Apply to join: https://aifoundations.school\nGitHub repository: https://github.com/aifoundations/course/",
    videoId: "iwvwi1_-0gw",
    githubLink: "https://github.com/aifoundations/course/"
  }
};

export default function VideoPlayer({ params }: { params: { id: string } }) {
  const video = videos[params.id as keyof typeof videos];
  
  if (!video) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/courses/ml-python">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-8">
            <h1 className="text-3xl font-bold mb-6">{video.title}</h1>

            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden mb-8">
              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
                style={{ border: 0 }}
              />
            </div>

            <div className="prose prose-zinc max-w-none">
              <div className="flex flex-col gap-4 mb-8">
                <a
                  href="https://aifoundations.school"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  Apply to AI Foundations
                </a>
                <a
                  href={video.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
                  </svg>
                  View Course Materials
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 