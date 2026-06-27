'use client';
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@site/components/ui/button";
import { Transcript } from '@site/components/Transcript';
import React, { useRef } from 'react';

const videos = {
  "1": {
    title: "AI Agent Camp: Building a ReAct agent from scratch",
    description: "In this workshop we will be learning how to make an agent in Python from scratch using the ReAct architecture. Python experience is strongly recommended!",
    videoId: "C0QdSBoJiMs",
    colabLink: "https://colab.research.google.com/drive/1RCVLkP_p4-ofPf4g-UPFSUAnG-c1ALBN"
  },
  "2": {
    title: "AI Agent Camp: Building a JSON agent from scratch",
    description: "In this workshop we will be learning how to make an agent in Python from using model-specific tool-use. This method brings benefits like typed tool-use inputs and better agent performance overall.",
    videoId: "xs5jTcv-2zY",
    colabLink: "https://colab.research.google.com/drive/1jTZnR_DimBMgatc6MS3iXd7kfpH4RGeX?usp=sharing"
  },
  "3": {
    title: "AI Agent Camp: Building a code execution agent from scratch",
    description: "In this workshop, we will be learning how to make an agent in Python that can run code in any programming language. This can add a ton of power and flexibility to your agents.",
    videoId: "s4TfsgOC3m8",
    colabLink: "https://colab.research.google.com/drive/1idZDXa1HRHU3mvN55sP-REGgUk1JBDrq?usp=sharing"
  },
  "4": {
    title: "AI Agent Camp: Building a browser use agent from scratch",
    description: "In this workshop, we will be learning how to make an agent in Python that can automate a web browser using Playwright.",
    videoId: "4hp9kIqlx7Q",
    colabLink: "https://colab.research.google.com/drive/1OqYAKT1OcAiQgIRE5PAAHBI4CB2lG-4n?usp=sharing"
  },
  "5": {
    title: "AI Agent Camp: Building a computer use agent from scratch",
    description: "In this workshop, we will be learning how to make a computer use agent in Python that can fully automate a desktop sandbox using the mouse and keyboard.",
    videoId: "Qnp4PQTE1Ag",
    colabLink: "https://colab.research.google.com/drive/1GV4VzhfI8l2uEBm2H9hQ2fs12_iFiYlQ?usp=sharing"
  }
};

export default function VideoPlayer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const video = videos[id as keyof typeof videos];
  const playerRef = useRef<HTMLIFrameElement>(null);

  if (!video) {
    notFound();
  }

  // Function to seek the YouTube video using postMessage API
  const handleSeek = (seconds: number) => {
    const iframe = playerRef.current;
    if (iframe) {
      iframe.contentWindow?.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [seconds, true],
        }),
        '*'
      );
    }
  };

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/courses/ai-agent-camp">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-8">
            <h1 className="text-3xl font-bold mb-6">{video.title}</h1>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 min-w-0">
                <div className="aspect-video w-full bg-black rounded-lg overflow-hidden mb-8 lg:mb-0">
                  <iframe
                    ref={playerRef}
                    src={`https://www.youtube.com/embed/${video.videoId}?enablejsapi=1`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                    style={{ border: 0 }}
                  />
                </div>
                <div className="prose prose-zinc max-w-none mt-8">
                  <h2 className="text-2xl font-semibold mb-4">About this video</h2>
                  <p className="text-lg text-muted-foreground mb-8">{video.description}</p>
                  <div className="flex flex-col gap-4">
                    <a
                      href={video.colabLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M1.292 5.856L11.54 0v24l-10.25-5.856V5.856zm21.416 11.288V5.856L12.46 0v24l10.25-5.856z"/>
                      </svg>
                      Open in Google Colab
                    </a>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0">
                <Transcript videoId={video.videoId} onSeek={handleSeek} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 