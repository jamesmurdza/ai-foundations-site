"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";
import { GitCompareArrows, MessageCircleMore, Compass } from "lucide-react";

const PILLARS = [
  {
    eyebrow: "Build",
    icon: GitCompareArrows,
    body: "Work alongside other builders on projects you care about. We live together, share meals, and support each other.",
  },
  {
    eyebrow: "Reflect",
    icon: MessageCircleMore,
    body: "Get feedback and guidance from experienced AI engineers and professionals.",
  },
  {
    eyebrow: "Explore",
    icon: Compass,
    body: "Step away from your routine. Try new things — yoga in the morning, healthy food, time to think.",
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
            Four weeks to learn and build things you care about.
          </h2>
        </div>

        <div className="mx-2 md:mx-10 px-6 md:px-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <figure className="hh-pillar relative aspect-[4/3] overflow-hidden rounded-lg border bg-white shadow-sm">
              <img
                src="/images/sketches/sketch-2.jpg"
                alt="A solitary boat on quiet water beneath karst mountains"
                className="object-cover w-full h-full"
              />
            </figure>
            <figure className="hh-pillar relative aspect-[4/3] overflow-hidden rounded-lg border bg-white shadow-sm">
              <img
                src="/images/sketches/sketch-4.jpg"
                alt="Open bamboo balcony with a team coding around a table"
                className="object-cover w-full h-full"
              />
            </figure>
            <div className="hh-pillar flex flex-col justify-center gap-6 p-6 rounded-lg border bg-card">
              <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 text-left">
                <span className="text-muted-foreground">Dates</span>
                <span className="font-medium">August 2025</span>
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">Southeast Asia</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-2 md:mx-10 px-6 md:px-12 text-center">
          <div className="flex flex-col gap-6">
            {PILLARS.map((p) => (
              <div
                key={p.eyebrow}
                className="hh-pillar flex flex-col md:flex-row md:items-center gap-4 p-6 rounded-[var(--radius)] bg-card border text-left"
              >
                <div className="flex items-center gap-3 md:w-32 flex-shrink-0">
                  <p.icon className="w-5 h-5 text-purple-600" />
                  <p className="text-sm uppercase tracking-widest text-purple-600">
                    {p.eyebrow}
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
