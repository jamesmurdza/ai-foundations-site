"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

const PILLARS = [
  {
    eyebrow: "01 / Build",
    title: "Build something real",
    body: "Each week you'll work on and finish a project. No tutorials — just building.",
  },
  {
    eyebrow: "02 / Ship",
    title: "Share your work",
    body: "You'll share updates and demo your work as you go. It's good practice for showing what you can do.",
  },
  {
    eyebrow: "03 / Be seen",
    title: "Leave with something to show",
    body: "You'll leave with a video walkthrough of your projects and references from us if things go well.",
  },
];

export function WhatIsItSection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hh-pillar", {
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            once: true,
          },
          y: 40,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="py-24 md:py-32 border-t">
      <div className="container">
        <div className="mx-2 md:mx-10 px-6 md:px-12 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-purple-600 mb-3">
            What it is
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl mx-auto mb-16">
            Four weeks to focus on building something you care about.
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {PILLARS.map((p) => (
              <div
                key={p.eyebrow}
                className="hh-pillar flex flex-col gap-3 p-6 rounded-[var(--radius)] bg-card border"
              >
                <p className="text-sm uppercase tracking-widest text-purple-600">
                  {p.eyebrow}
                </p>
                <h3 className="font-heading text-2xl font-semibold leading-tight">
                  {p.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
