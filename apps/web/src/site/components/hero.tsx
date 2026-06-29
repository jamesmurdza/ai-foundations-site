import { Brain, Code, CircuitBoard, Sparkle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@site/components/ui/button";

export function Hero() {
  return (
    <section>
      <div className="container">
        <div className="border-x border-t-0 px-4 py-3 flex justify-center">
          <Link
            href="/summer-school"
            className="group inline-flex items-center gap-2 text-sm hover:text-[#4c24c6] transition-colors"
          >
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#5b2bee] animate-pulse" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">Applications open:</span>{" "}
              4-week Summer School — applications open
            </span>
            <span className="text-[#5b2bee] group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </Link>
        </div>
        <div className="flex flex-col items-center gap-6 pt-20 mb-4 border border-t-0 relative">
          <h1 className="text-center font-heading font-semibold tracking-tight text-balance max-w-3xl md:text-7xl text-5xl sm:text-6xl">
            Learn AI From the Ground Up
          </h1>
        </div>
        <div className="flex items-center justify-center gap-12 mt-8 py-6 border-x relative">
          <div className="flex flex-wrap gap-y-4 justify-center gap-x-16">
            <div className="flex items-center gap-2 justify-center">
              <Brain aria-hidden="true" className="w-5 h-5 text-[#5b2bee]" />
              <span className="text-muted-foreground">Machine Learning</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Code aria-hidden="true" className="w-5 h-5 text-[#5b2bee]" />
              <span className="text-muted-foreground">AI Automation</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <CircuitBoard aria-hidden="true" className="w-5 h-5 text-[#5b2bee]" />
              <span className="text-muted-foreground">AI Engineering</span>
            </div>
          </div>
          <Sparkle
            aria-hidden="true"
            size={20}
            className="absolute left-0 -translate-x-1/2 fill-foreground top-0 -translate-y-1/2"
          />
          <Sparkle
            aria-hidden="true"
            size={20}
            className="absolute fill-foreground right-0 translate-x-1/2 top-0 -translate-y-1/2"
          />
        </div>

        <div className="border-x px-6 md:px-12 py-10">
          <Image alt="Preview of the AI Foundations learning platform" src="/images/main-image.png" width={1795} height={876} priority className="rounded-lg border border-border" />
        </div>
        <div className="flex flex-col items-center gap-6 text-center border-x px-6 md:px-12 pb-20">
          <h2 className="text-xl md:text-2xl font-sans text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium px-4">
            <span className="text-foreground font-semibold">AI Foundations</span> is an online school where you learn to build AI models from first principles alongside professional mentors and new friends
          </h2>
          <form
            action="https://aifoundations.tinysend.com/subscribe"
            method="post"
            className="flex flex-col sm:flex-row w-full max-w-lg gap-3 px-4"
          >
            <label htmlFor="hero-email" className="sr-only">
              Email address
            </label>
            <input
              id="hero-email"
              type="email"
              name="email"
              placeholder="name@email.com"
              required
              className="flex-1 w-full px-4 py-3 bg-muted/50 rounded-lg border text-base min-w-0"
            />
            {/* Honeypot: real users never fill this; bots that do are dropped. */}
            <div
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}
            >
              <input type="text" name="hp_company" tabIndex={-1} autoComplete="off" />
            </div>
            <Button
              type="submit"
              size="lg"
              className="whitespace-nowrap bg-[#5b2bee] hover:bg-[#4c24c6] text-white px-6"
            >
              Get updates!
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
