"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@site/lib/gsap";

export function IntroSection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hh-intro", {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto items-center">
            <figure className="hh-intro relative aspect-[4/3] overflow-hidden border">
              <img
                src="/images/summer-school/accommodation-balcony.avif"
                alt="A calm wooden balcony with natural-wood tables, potted plants and string lights surrounded by greenery"
                className="object-cover w-full h-full"
              />
            </figure>
            <div className="hh-intro flex flex-col justify-center">
              <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-5">
                Learn and teach for four weeks in Bandung.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The AI Summer School is our first pop-up school: 12 people will
                live together in Bandung, Indonesia while simultaneously learning
                and teaching. We have been running AI and coding workshops for
                years, and this is our most exciting program so far.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
