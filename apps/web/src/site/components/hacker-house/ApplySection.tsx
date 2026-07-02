"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@site/lib/gsap";
import { Button } from "@site/components/ui/button";

export function ApplySection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hh-apply-content > *", {
          scrollTrigger: {
            trigger: root.current,
            start: "top 70%",
            once: true,
          },
          y: 24,
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
        <div className="mx-auto max-w-3xl text-center px-6">
          <div className="hh-apply-content flex flex-col items-center gap-6">
            <p className="text-sm uppercase tracking-[0.2em] text-purple-600">
              Applications
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
              How to apply
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
              A few quick details. Takes about a minute.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 h-12 mt-4"
            >
              <Link href="/summer-school/apply">Start your application →</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Applications for the online program are open.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
