"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@site/lib/gsap";
import { MapPin, Calendar } from "lucide-react";

export function HeroSection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          [".hh-eyebrow", ".hh-headline", ".hh-tagline", ".hh-sub", ".hh-meta", ".hh-figure"],
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.08,
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative pt-12 pb-24 overflow-hidden">
      <div className="container">
        <div className="border-x border-t-0 px-6 md:px-12 pt-20 pb-10 relative flex flex-col items-center text-center">
          <p className="hh-eyebrow text-sm uppercase tracking-[0.2em] text-primary mb-6">
            AI Foundations · Summer School
          </p>
          <h1 className="hh-headline font-heading font-semibold tracking-tight text-balance max-w-4xl text-5xl sm:text-6xl md:text-7xl leading-[1.05]">
            AI Summer School
          </h1>
          <p className="hh-tagline mt-6 text-xl md:text-2xl text-foreground max-w-2xl leading-relaxed">
            An inclusive living and learning community.
          </p>
          <p className="hh-sub mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            AI Foundations invites people of all ages to join an in-person
            community of learners with a focus on software development and AI.
          </p>

          <div className="hh-meta mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-foreground">West Java, Indonesia</span>
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-foreground">27th July – 21st August 2026</span>
            </span>
          </div>
        </div>

        <div className="hh-figure border-x border-b-0 px-6 md:px-12 pb-16">
          <figure className="relative aspect-[16/9] overflow-hidden border">
            <img
              src="/images/summer-school/venue-aerial.png"
              alt="Aerial view of a lush green forested hillside in West Java with a wooden viewing walkway"
              className="object-cover w-full h-full"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
