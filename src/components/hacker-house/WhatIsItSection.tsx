"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

const PILLARS = [
  {
    eyebrow: "01 / Build",
    title: "Real things, with your hands.",
    body: "Every week is a build week. You ship something usable, even if it's small. No tutorials disguised as projects.",
  },
  {
    eyebrow: "02 / Ship",
    title: "Public from day one.",
    body: "We ship in public. You'll write, post, and demo your work as you go. The internet is the room you're building for.",
  },
  {
    eyebrow: "03 / Be seen",
    title: "A portfolio with proof.",
    body: "You leave with a recorded walkthrough of your projects, a network of five other builders, and people who can vouch for what you built.",
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
            A focused house. A short window. The most builder energy you&apos;ve
            been around in a while.
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
