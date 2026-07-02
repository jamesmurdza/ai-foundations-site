"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@site/lib/gsap";

export function ProgressBar({ progress }: { progress: number }) {
  registerGsap();
  const fillRef = useRef<HTMLDivElement>(null);
  const clamped = Math.max(0, Math.min(1, progress));

  useGSAP(
    () => {
      gsap.to(fillRef.current, {
        scaleX: clamped,
        duration: 0.6,
        ease: "power3.out",
      });
    },
    { dependencies: [clamped] },
  );

  return (
    <div className="fixed top-0 inset-x-0 z-40 h-1 bg-muted/40">
      <div
        ref={fillRef}
        className="h-full origin-left bg-primary"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
