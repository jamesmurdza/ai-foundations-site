"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@site/lib/gsap";

const TOPICS = [
  "AI agents",
  "UI/UX design",
  "open source collaboration",
  "AI evals",
  "AI ethics",
];

export function TopicsSection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hh-topic", {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto items-center">
            <figure className="hh-topic relative aspect-[4/3] overflow-hidden border order-1">
              <img
                src="/images/summer-school/community-workshop.png"
                alt="A room of learners working at laptops around wooden tables, greenery overhead"
                className="object-cover w-full h-full"
              />
            </figure>
            <div className="hh-topic order-2">
              <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-6">
                Explore your interests
              </h2>
              <div className="flex flex-wrap gap-3">
                {TOPICS.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-primary/30 bg-primary/5 px-5 py-2 font-heading text-base font-medium text-primary"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
