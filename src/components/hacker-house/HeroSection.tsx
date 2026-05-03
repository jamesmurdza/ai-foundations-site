"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";
import { Button } from "@/components/ui/button";

const SKETCHES = [
  {
    src: "/images/sketches/sketch-2.jpg",
    alt: "A solitary boat on quiet water beneath karst mountains, conical hat, lotus pads in the foreground",
  },
  {
    src: "/images/sketches/sketch-4.jpg",
    alt: "Open bamboo balcony with a team coding around a table, looking out over a river valley and karst mountains",
  },
];

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
            AI Foundations · Summer School
          </p>
          <h1 className="hh-headline font-heading font-semibold tracking-tight text-balance max-w-4xl text-5xl sm:text-6xl md:text-7xl leading-[1.05]">
            AI Foundations is hosting our first summer school.
          </h1>
          <p className="hh-sub mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            You will learn and teach in a community that grows through building
            together.
          </p>
        </div>

        <div className="mx-2 md:mx-10 border-x border-b-0 px-6 md:px-12 pt-4 pb-12 flex flex-col items-center gap-3">
          <Button
            asChild
            size="lg"
            className="hh-cta bg-purple-600 hover:bg-purple-700 text-white px-8 h-12"
          >
            <Link href="/hacker-house/apply">Apply now →</Link>
          </Button>
          <p className="hh-cta text-sm text-muted-foreground">
            It takes about ten minutes to apply.
          </p>
        </div>

        <div className="mx-2 md:mx-10 border-x px-4 md:px-6 pb-16 grid grid-cols-1 md:grid-cols-2 gap-4">
          {SKETCHES.map((s, i) => (
            <figure
              key={s.src}
              className="hh-cta relative aspect-[4/3] overflow-hidden rounded-lg border bg-white shadow-sm"
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                priority={i < 2}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
