"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

export function DetailsSection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hh-details", {
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
        <div className="mx-2 md:mx-10 px-6 md:px-12">
          <div className="text-center mb-12">
            <p className="hh-details text-sm uppercase tracking-[0.2em] text-purple-600 mb-3">
              When & Where
            </p>
            <h2 className="hh-details font-heading text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl mx-auto">
              Four weeks in Southeast Asia, August 2025
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <figure className="hh-details relative aspect-[4/3] overflow-hidden rounded-lg border bg-white shadow-sm">
              <img
                src="/images/sketches/sketch-2.jpg"
                alt="A solitary boat on quiet water beneath karst mountains"
                className="object-cover w-full h-full"
              />
            </figure>
            <div className="hh-details flex flex-col justify-center text-lg text-muted-foreground leading-relaxed">
              <p>
                We'll live and work together in a quiet location. Exact details shared with accepted applicants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
