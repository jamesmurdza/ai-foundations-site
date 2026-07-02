"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@site/lib/gsap";
import { CardStage } from "./CardStage";

const STAGES = [
  "One moment…",
  "Still working…",
  "Almost there…",
  "Just a few more seconds…",
];

const STAGE_AT = [0, 4, 9, 14];

export function GeneratingCard({ message }: { message?: string } = {}) {
  registerGsap();
  const [stage, setStage] = useState(0);
  const dotsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      let next = 0;
      for (let i = 0; i < STAGE_AT.length; i++) {
        if (elapsed >= STAGE_AT[i]) next = i;
      }
      setStage(next);
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const dots = dotsRef.current?.querySelectorAll("[data-dot]");
        if (dots && dots.length > 0) {
          gsap.to(dots, {
            y: -6,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            duration: 0.5,
            stagger: 0.12,
          });
        }
        if (barRef.current) {
          gsap.fromTo(
            barRef.current,
            { width: "6%" },
            { width: "92%", duration: 14, ease: "power1.out" },
          );
        }
      });
      return () => mm.revert();
    },
    { dependencies: [] },
  );

  return (
    <CardStage>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
          Working
        </p>
        <div className="relative h-20 sm:h-16 max-w-md w-full flex items-start justify-center">
          <h2
            key={message ?? stage}
            className="font-heading text-2xl font-semibold leading-tight animate-in fade-in slide-in-from-bottom-1 duration-500"
          >
            {message ?? STAGES[stage]}
          </h2>
        </div>
        <p className="text-muted-foreground max-w-sm">
          We&apos;re generating a couple of follow-up questions based on your answers.
          Usually about ten seconds.
        </p>

        <div className="w-full max-w-xs h-1 mt-8 bg-muted/40 rounded-full overflow-hidden">
          <div
            ref={barRef}
            className="h-full bg-primary rounded-full"
            style={{ width: "6%" }}
          />
        </div>

        <div ref={dotsRef} className="flex items-center gap-2 mt-6">
          <span data-dot className="w-2 h-2 rounded-full bg-primary" />
          <span data-dot className="w-2 h-2 rounded-full bg-primary" />
          <span data-dot className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>
    </CardStage>
  );
}
