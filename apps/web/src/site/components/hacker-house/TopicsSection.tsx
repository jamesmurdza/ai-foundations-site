"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@site/lib/gsap";

const TOPICS = [
  "Building Agents from Scratch",
  "Voice Agents",
  "UI/UX Design",
  "Open Source Development",
  "Portfolio Development",
  "AI Evals",
];

export function TopicsSection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hh-topic", {
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            once: true,
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="py-24 md:py-32 border-t">
      <div className="container">
        <div className="mx-2 md:mx-10 px-6 md:px-12">
          <div className="text-center mb-12">
            <p className="hh-topic text-sm uppercase tracking-[0.2em] text-primary mb-3">
              The curriculum
            </p>
            <h2 className="hh-topic font-heading text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl mx-auto">
              What you&apos;ll explore
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-border border max-w-4xl mx-auto">
            {TOPICS.map((topic) => (
              <div
                key={topic}
                className="hh-topic bg-background p-8 flex items-center justify-center text-center min-h-[140px]"
              >
                <h3 className="font-heading text-xl font-semibold tracking-tight">
                  {topic}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
