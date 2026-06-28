"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

const YOU_ARE = [
  "You love building with code, low-code, or no-code.",
  "You're excited about open-source.",
  "You're honest about what you don't know yet.",
  "You like to help others and share what you learn.",
  "College students and junior developers are welcome.",
];

export function WhoItsForSection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hh-row", {
          scrollTrigger: {
            trigger: root.current,
            start: "top 70%",
            once: true,
          },
          x: -30,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.06,
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="py-24 md:py-32 border-t bg-muted/20">
      <div className="container">
        <div className="mx-2 md:mx-10 px-6 md:px-12">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-purple-600 mb-3">
              Who it&apos;s for
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl mx-auto mb-16">
              Who this is for
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <figure className="hh-row relative aspect-[4/3] overflow-hidden">
              <img
                src="/images/sketches/sketch-6.jpg"
                alt="Sketch of builders collaborating"
                className="object-cover w-full h-full mix-blend-multiply contrast-110 brightness-105"
              />
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_30px_white]" />
            </figure>
            <div className="hh-row flex flex-col justify-center">
              <ul className="space-y-4">
                {YOU_ARE.map((line) => (
                  <li
                    key={line}
                    className="hh-row text-lg leading-relaxed flex items-start gap-3"
                  >
                    <span className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-foreground flex-shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
