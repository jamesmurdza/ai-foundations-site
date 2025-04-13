import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "AI Agent Camp (Python)",
  description: "Learn to build AI Agents with Python through this comprehensive course",
};

const videos = [
  {
    id: "1",
    title: "AI Agent Camp: Building a ReAct agent from scratch",
    description: "Learn how to build a ReAct agent that can reason and act based on given tasks",
    videoId: "C0QdSBoJiMs",
    thumbnail: "https://img.youtube.com/vi/C0QdSBoJiMs/hqdefault.jpg",
    duration: "1:18:52",
    colabLink: "https://colab.research.google.com/drive/1RCVLkP_p4-ofPf4g-UPFSUAnG-c1ALBN"
  },
  {
    id: "2",
    title: "AI Agent Camp: Building a JSON agent from scratch",
    description: "Create an AI agent that can understand and manipulate JSON data structures",
    videoId: "xs5jTcv-2zY",
    thumbnail: "https://img.youtube.com/vi/xs5jTcv-2zY/hqdefault.jpg",
    duration: "1:15:22",
    colabLink: "https://colab.research.google.com/drive/1jTZnR_DimBMgatc6MS3iXd7kfpH4RGeX?usp=sharing"
  },
  {
    id: "3",
    title: "AI Agent Camp: Building a code execution agent from scratch",
    description: "Learn to build an AI agent that can execute and understand code",
    videoId: "s4TfsgOC3m8",
    thumbnail: "https://img.youtube.com/vi/s4TfsgOC3m8/hqdefault.jpg",
    duration: "1:04:43",
    colabLink: "https://colab.research.google.com/drive/1idZDXa1HRHU3mvN55sP-REGgUk1JBDrq?usp=sharing"
  },
  {
    id: "4",
    title: "AI Agent Camp: Building a browser use agent from scratch",
    description: "Create an AI agent that can interact with web browsers and perform tasks",
    videoId: "4hp9kIqlx7Q",
    thumbnail: "https://img.youtube.com/vi/4hp9kIqlx7Q/hqdefault.jpg",
    duration: "1:25:14",
    colabLink: "https://colab.research.google.com/drive/1OqYAKT1OcAiQgIRE5PAAHBI4CB2lG-4n?usp=sharing"
  },
  {
    id: "5",
    title: "AI Agent Camp: Building a computer use agent from scratch",
    description: "Learn to build an AI agent that can interact with computer systems",
    videoId: "Qnp4PQTE1Ag",
    thumbnail: "https://img.youtube.com/vi/Qnp4PQTE1Ag/hqdefault.jpg",
    duration: "1:25:47",
    colabLink: "https://colab.research.google.com/drive/1GV4VzhfI8l2uEBm2H9hQ2fs12_iFiYlQ?usp=sharing"
  }
];

export default function AIAgentCampCourse() {
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
            <h1 className="text-4xl font-bold mb-4">AI Agent Camp (Python)</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Learn to build AI Agents with Python through this comprehensive course. 
              Master the fundamentals of AI Agents, LLMs, and create your own intelligent systems.
            </p>
          </div>

          <div className="grid gap-6">
            {videos.map((video) => (
              <Link 
                key={video.id}
                href={`/courses/ai-agent-camp/${video.id}`}
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
                  <div className="mt-4">
                    <a
                      href={video.colabLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                        <path d="M1.292 5.856L11.54 0v24l-10.25-5.856V5.856zm21.416 11.288V5.856L12.46 0v24l10.25-5.856z"/>
                      </svg>
                      Open in Google Colab
                    </a>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 