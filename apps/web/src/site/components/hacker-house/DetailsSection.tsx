"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@site/lib/gsap";
import { MapPin, Calendar, Home } from "lucide-react";

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
              A living and learning community
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <figure className="hh-details relative aspect-[4/3] overflow-hidden">
              <img
                src="/images/sketches/sketch-2.jpg"
                alt="A solitary boat on quiet water beneath karst mountains"
                className="object-cover w-full h-full mix-blend-multiply contrast-110 brightness-105"
              />
            </figure>
            <div className="hh-details flex flex-col justify-center">
              <div className="flex flex-col gap-4 text-left text-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">West Java, Indonesia</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">27th July - 21st August 2026</span>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">Spacious accommodation in a peaceful setting</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hh-details mt-12 max-w-4xl mx-auto rounded-[var(--radius)] border bg-muted/40 px-6 py-5 text-center">
            <p className="text-base">
              <span className="font-medium">
                Applications for the in-person program are now closed.
              </span>{" "}
              Applications for the online program are still open.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
