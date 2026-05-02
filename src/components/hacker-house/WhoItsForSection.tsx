"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

const YOU_ARE = [
  "A builder — code, low-code, or no-code. College students especially welcome.",
  "Hungry to ship and willing to do the unglamorous parts.",
  "Eager to learn, fast. You don't need to be told twice.",
  "Honest about what you don't know yet.",
  "Excited by other builders. Generous with what you find.",
];

const YOU_ARE_NOT = [
  "Looking for a vacation in a new country.",
  "Hoping someone else will define your work for you.",
  "Allergic to feedback or shipping in public.",
  "Treating this like a side project around bigger plans.",
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
          x: (i) => (i % 2 === 0 ? -30 : 30),
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
              Six people we&apos;d want to build with for a month.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 max-w-4xl mx-auto">
            <div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-6 inline-flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                You are
              </h3>
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
            <div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-6 inline-flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
                You&apos;re not
              </h3>
              <ul className="space-y-4">
                {YOU_ARE_NOT.map((line) => (
                  <li
                    key={line}
                    className="hh-row text-lg leading-relaxed flex items-start gap-3 text-muted-foreground"
                  >
                    <span className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
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
