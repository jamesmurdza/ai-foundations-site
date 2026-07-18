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
          [".hh-eyebrow", ".hh-headline", ".hh-tagline"],
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.1,
          },
        );
        gsap.fromTo(
          [".hh-sub", ".hh-meta"],
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.08,
            delay: 0.35,
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
        <div className="border-x px-6 md:px-12 pt-6 pb-16">
          {/* Title overlaid on the header image */}
          <figure className="relative overflow-hidden border min-h-[560px] md:min-h-[640px] flex items-center justify-center">
            <img
              src="/images/summer-school/venue-aerial.png"
              alt="Aerial view of a lush green forested hillside in West Java with a wooden viewing walkway"
              className="absolute inset-0 object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/25" />
            <figcaption className="relative z-10 flex flex-col items-center text-center px-6 py-12 text-white">
              <p className="hh-eyebrow text-sm uppercase tracking-[0.2em] text-white/85 mb-6">
                AI Foundations · Summer School
              </p>
              <h1 className="hh-headline font-heading font-semibold tracking-tight text-balance max-w-4xl text-5xl sm:text-6xl md:text-7xl leading-[1.05] drop-shadow-sm">
                AI Summer School
              </h1>
              <p className="hh-tagline mt-6 text-xl md:text-2xl text-white/90 max-w-2xl leading-relaxed">
                An inclusive living and learning community.
              </p>
            </figcaption>
          </figure>

          {/* Supporting copy below the image, within the frame */}
          <div className="flex flex-col items-center text-center pt-10">
            <p className="hh-sub text-lg text-muted-foreground max-w-2xl leading-relaxed">
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
        </div>
      </div>
    </section>
  );
}
