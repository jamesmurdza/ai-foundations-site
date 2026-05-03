"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

const YOU_ARE = [
  "Someone who builds things — code, low-code, or no-code. College students welcome.",
  "Willing to do the unglamorous parts of finishing a project.",
  "Quick to pick things up.",
  "Honest about what you don't know yet.",
  "Happy to help others and share what you learn.",
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
          <div className="max-w-2xl mx-auto">
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
    </section>
  );
}
