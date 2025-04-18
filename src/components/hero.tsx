"use client";

import { Brain, Code, CircuitBoard, Sparkle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

async function joinWaitlist(email: string) {
  return fetch("https://api.getwaitlist.com/api/v1/waiter/", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      "api_key": "19252",
      "email": email,
      "referral_link": "https://aifoundations.school/"
    })
  });
}

export function Hero() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const response = await joinWaitlist(email);
      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <section className="pb-10">
      <div className="container">
        <div className="flex flex-col items-center gap-6 pt-20 mb-4 border border-t-0 mx-2 md:mx-10 relative">
          
          <h1 className="text-center font-heading font-semibold tracking-tight text-balance max-w-3xl md:text-7xl text-5xl sm:text-6xl">
            Learn AI From the Ground Up
          </h1>
          
          
        </div>
        <div className="flex items-center justify-center gap-12 mt-8 py-6 border-x mx-2 md:mx-10 relative">
          <div className="flex flex-wrap gap-y-4 justify-center gap-x-16">
            <div className="flex items-center gap-2 justify-center">
              <Brain className="w-5 h-5 text-purple-500" />
              <span className="text-muted-foreground">Machine Learning</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Code className="w-5 h-5 text-purple-500" />
              <span className="text-muted-foreground">AI Automation</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <CircuitBoard className="w-5 h-5 text-purple-500" />
              <span className="text-muted-foreground">AI Engineering</span>
            </div>
          </div>
          <Sparkle
            size={20}
            className="absolute left-0 -translate-x-1/2 fill-foreground top-0 -translate-y-1/2"
          />
          <Sparkle
            size={20}
            className="absolute fill-foreground right-0 translate-x-1/2 top-0 -translate-y-1/2"
          />
        </div>
        
        <div className="p-10 rounded-2xl">
          <Image alt="Image" src="/images/main-image.avif" width={1300} height={698} />
        </div>
        <div className="flex flex-col items-center gap-6 mb-12 text-center">
          <h2 className="text-xl md:text-2xl font-sans text-[#888888] max-w-2xl mx-auto leading-relaxed font-medium px-4">
            <span className="text-zinc-700 font-semibold">AI Foundations</span> is an online school where you learn to build AI models from first principles alongside professional mentors and new friends
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row w-full max-w-lg gap-3 px-4">
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full px-4 py-3 bg-muted/50 rounded-lg border text-base min-w-0"
                required
              />
              {status === "error" && (
                <p className="absolute text-sm text-red-500 mt-1">Something went wrong. Please try again.</p>
              )}
              {status === "success" && (
                <p className="absolute text-sm text-green-500 mt-1">You'll be notified of updates!</p>
              )}
            </div>
            <Button 
              type="submit" 
              size="lg" 
              disabled={status === "loading"}
              className="whitespace-nowrap  hover:bg-primary/80 text-white px-6"
            >
              {status === "loading" ? "Subscribing..." : "Get updates!"}
            </Button>
          </form>
          
        </div>
      </div>
    </section>
  );
}
