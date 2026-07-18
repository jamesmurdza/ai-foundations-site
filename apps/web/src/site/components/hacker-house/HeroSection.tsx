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
          ".hh-headline",
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        );
        gsap.fromTo(
          [".hh-tagline", ".hh-sub", ".hh-meta"],
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.08,
            delay: 0.3,
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative pt-10 overflow-hidden">
      <div className="container">
        <figure className="relative overflow-hidden min-h-[560px] md:min-h-[640px] flex items-center justify-center">
            <img
              src="/images/summer-school/venue-aerial.png"
              alt="Aerial view of a lush green forested hillside in West Java with a wooden viewing walkway"
              className="absolute inset-0 object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/10" />
            <figcaption className="absolute inset-0 z-10 flex flex-col px-6 py-10 text-white">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h1 className="hh-headline font-heading font-semibold tracking-tight text-balance max-w-4xl text-5xl sm:text-6xl md:text-7xl leading-[1.05] mb-5 drop-shadow-sm">
                  AI Summer School
                </h1>
                <p className="hh-tagline text-2xl md:text-3xl font-heading font-semibold tracking-tight text-white max-w-2xl leading-tight">
                  An inclusive living and learning community.
                </p>
                <p className="hh-sub mt-6 text-base md:text-lg text-white/85 max-w-2xl leading-relaxed">
                  AI Foundations invites learners of all ages to join an in-person
                  community focused on personal growth and lifelong learning.
                </p>
              </div>
              <div className="hh-meta flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
                <span className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Bandung, Indonesia</span>
                </span>
                <span className="flex items-center gap-2 text-white/90">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">27th July – 21st August 2026</span>
                </span>
              </div>
            </figcaption>
        </figure>
      </div>
    </section>
  );
}
