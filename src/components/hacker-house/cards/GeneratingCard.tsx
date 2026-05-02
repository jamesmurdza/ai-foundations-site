"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";
import { CardStage } from "./CardStage";

export function GeneratingCard({
  message = "Reading your answers…",
}: {
  message?: string;
}) {
  registerGsap();
  const dotsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const dots = dotsRef.current?.querySelectorAll("[data-dot]");
        if (!dots) return;
        gsap.to(dots, {
          y: -6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          duration: 0.5,
          stagger: 0.12,
        });
      });
      return () => mm.revert();
    },
    { dependencies: [] },
  );

  return (
    <CardStage>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
          One sec
        </p>
        <h2 className="font-heading text-2xl font-semibold leading-tight mb-3">
          {message}
        </h2>
        <p className="text-muted-foreground max-w-sm">
          We&apos;re generating five follow-up questions just for you. Takes about
          three seconds.
        </p>
        <div ref={dotsRef} className="flex items-center gap-2 mt-8">
          <span data-dot className="w-2 h-2 rounded-full bg-purple-500" />
          <span data-dot className="w-2 h-2 rounded-full bg-purple-500" />
          <span data-dot className="w-2 h-2 rounded-full bg-purple-500" />
        </div>
      </div>
    </CardStage>
  );
}
