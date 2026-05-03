"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

const OUTCOMES = [
  {
    label: "Three shipped projects",
    body: "Two scoped builds plus a final piece of work, all with public links and recorded demos.",
  },
  {
    label: "A portfolio walkthrough",
    body: "A 5-minute video tour of what you built, made for hiring managers and people who fund builders.",
  },
  {
    label: "Mentorship from us",
    body: "Daily reviews, weekly 1:1s, and unfair access to whatever Burhan and James can wire up for you.",
  },
  {
    label: "Five other builders",
    body: "A small group you'll trade work with for the rest of your career. The whole point.",
  },
  {
    label: "A public demo day",
    body: "We invite an audience of investors, founders, and operators. You demo. They watch.",
  },
  {
    label: "A reference, if it goes well",
    body: "If you do the work, we vouch for it. Loudly.",
  },
];

export function OutcomesSection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hh-outcome", {
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            once: true,
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
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
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-purple-600 mb-3">
              What you walk away with
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl mx-auto mb-16">
              Receipts, not certificates.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-6 max-w-5xl mx-auto">
            {OUTCOMES.map((o, i) => (
              <div
                key={o.label}
                className="hh-outcome flex gap-5 items-start py-6 border-t"
              >
                <span className="font-heading text-xl text-purple-600 flex-shrink-0 w-8">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-heading text-xl font-semibold mb-2">
                    {o.label}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {o.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
