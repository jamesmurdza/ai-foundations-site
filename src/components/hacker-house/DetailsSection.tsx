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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <figure className="hh-details relative aspect-[4/3] overflow-hidden rounded-lg border bg-white shadow-sm">
              <img
                src="/images/sketches/sketch-2.jpg"
                alt="A solitary boat on quiet water beneath karst mountains"
                className="object-cover w-full h-full"
              />
            </figure>
            <div className="hh-details flex flex-col justify-center gap-6 p-8 rounded-lg border bg-card">
              <div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-4 text-left text-lg">
                <span className="text-muted-foreground">Dates</span>
                <span className="font-medium">August 2025</span>
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">Southeast Asia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
