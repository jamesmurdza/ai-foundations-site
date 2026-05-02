"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type CardStageProps = {
  children: React.ReactNode;
  className?: string;
  showPeek?: boolean;
};

export function CardStage({
  children,
  className,
  showPeek = true,
}: CardStageProps) {
  registerGsap();
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(cardRef.current, {
          scale: 0.96,
          opacity: 0,
          y: 14,
          ease: "back.out(1.4)",
          duration: 0.45,
        });
      });
      return () => mm.revert();
    },
    { scope: cardRef, dependencies: [] },
  );

  return (
    <div className="relative w-full max-w-md mx-auto">
      {showPeek && (
        <>
          <div
            className="absolute inset-0 -z-10 bg-card border rounded-[var(--radius)] shadow-sm origin-top scale-[0.96] translate-y-3 opacity-80"
            aria-hidden
          />
          <div
            className="absolute inset-0 -z-20 bg-card border rounded-[var(--radius)] origin-top scale-[0.92] translate-y-6 opacity-50"
            aria-hidden
          />
        </>
      )}
      <div
        ref={cardRef}
        className={cn(
          "relative bg-card border rounded-[var(--radius)] shadow-lg p-8 min-h-[480px] flex flex-col",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
