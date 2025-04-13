import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Machine Learning in Python Course",
  description: "Learn Machine Learning with Python through this comprehensive course",
};

const videos = [
  {
    id: "1",
    title: "Machine Learning in Python: Introduction",
    description: "Get started with Machine Learning in Python. Learn the fundamentals and set up your development environment.",
    videoId: "uzKF08iaxu0",
    thumbnail: "https://img.youtube.com/vi/uzKF08iaxu0/hqdefault.jpg",
    duration: "1:15:00"
  },
  {
    id: "2",
    title: "AI Foundations: Linear Regression in Machine Learning",
    description: "Learn how to process and prepare data for machine learning models.",
    videoId: "OJTqB2wlvyA",
    thumbnail: "https://img.youtube.com/vi/OJTqB2wlvyA/hqdefault.jpg",
    duration: "1:30:00"
  },
  {
    id: "3",
    title: "AI Foundations: Linear Regression Demo",
    description: "Understand how to train machine learning models effectively.",
    videoId: "t4agKQrQou4",
    thumbnail: "https://img.youtube.com/vi/t4agKQrQou4/hqdefault.jpg",
    duration: "1:45:00"
  },
  {
    id: "4",
    title: "AI Foundations: Logistic Regression",
    description: "Learn techniques for evaluating and improving model performance.",
    videoId: "RtDeNk00_FE",
    thumbnail: "https://img.youtube.com/vi/RtDeNk00_FE/hqdefault.jpg",
    duration: "1:20:00"
  },
  {
    id: "5",
    title: "AI Foundations: Would you survive the titanic disaster?",
    description: "Explore advanced machine learning concepts and techniques.",
    videoId: "iwvwi1_-0gw",
    thumbnail: "https://img.youtube.com/vi/iwvwi1_-0gw/hqdefault.jpg",
    duration: "1:35:00"
  }
];

export default function MLPythonCourse() {
  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-8 mb-8">
            <h1 className="text-4xl font-bold mb-4">Machine Learning in Python</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Learn Machine Learning with Python through this comprehensive course. 
              Master the fundamentals and advanced concepts with hands-on projects.
            </p>

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
                href="https://github.com/aifoundations/course/"
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

          <div className="grid gap-6">
            {videos.map((video) => (
              <Link 
                key={video.id}
                href={`/courses/ml-python/${video.id}`}
                className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-4 flex gap-6"
              >
                <div className="relative w-64 h-36 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-white text-sm">
                    {video.duration}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
                  <p className="text-muted-foreground">{video.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 