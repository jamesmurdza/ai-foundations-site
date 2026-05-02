"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          [".hh-eyebrow", ".hh-headline", ".hh-sub", ".hh-stat", ".hh-cta"],
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.08,
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative pt-12 pb-24 overflow-hidden">
      <div className="container">
        <div className="mx-2 md:mx-10 border-x border-t-0 px-6 md:px-12 pt-20 pb-12 relative flex flex-col items-center text-center">
          <p className="hh-eyebrow text-sm uppercase tracking-[0.2em] text-purple-600 mb-6">
            AI Foundations · Hacker House
          </p>
          <h1 className="hh-headline font-heading font-semibold tracking-tight text-balance max-w-4xl text-5xl sm:text-6xl md:text-7xl leading-[1.05]">
            Six builders. One month. A portfolio that&apos;s actually yours.
          </h1>
          <p className="hh-sub mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            A 4-week, in-person hacker house for six builders from anywhere in
            the world. You arrive curious. You leave with work that&apos;s actually
            yours, and people who&apos;ll ship with you for years.
          </p>
        </div>

        <div className="mx-2 md:mx-10 border-x px-6 md:px-12 py-10 flex justify-center">
          <div className="grid grid-cols-2 gap-16 sm:gap-24 max-w-xl">
            <Stat label="Weeks" target={4} />
            <Stat label="Builders" target={6} />
          </div>
        </div>

        <div className="mx-2 md:mx-10 border-x border-b-0 px-6 md:px-12 pt-2 pb-16 flex flex-col items-center gap-3">
          <Button
            asChild
            size="lg"
            className="hh-cta bg-purple-600 hover:bg-purple-700 text-white px-8 h-12"
          >
            <Link href="/hacker-house/apply">Apply now →</Link>
          </Button>
          <p className="hh-cta text-sm text-muted-foreground">
            Six spots. Rolling decisions. About 5 minutes to apply.
          </p>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, target }: { label: string; target: number }) {
  return (
    <div className="hh-stat flex flex-col items-center text-center">
      <span className="font-heading text-6xl md:text-7xl font-semibold tracking-tight">
        {target}
      </span>
      <span className="text-sm uppercase tracking-widest text-muted-foreground mt-2">
        {label}
      </span>
    </div>
  );
}
