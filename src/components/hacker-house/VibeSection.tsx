"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

const SKETCHES = [
  {
    src: "/images/sketches/sketch-2.jpg",
    alt: "A solitary boat on quiet water beneath karst mountains, conical hat, lotus pads in the foreground",
    span: "md:col-span-6",
  },
  {
    src: "/images/sketches/sketch-4.jpg",
    alt: "Open bamboo balcony with a team coding around a table, looking out over a river valley and karst mountains",
    span: "md:col-span-6",
  },
];

export function VibeSection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hh-vibe-head > *", {
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
            once: true,
          },
          y: 24,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
        });
        gsap.from(".hh-vibe-tile", {
          scrollTrigger: {
            trigger: ".hh-vibe-grid",
            start: "top 85%",
            once: true,
          },
          y: 32,
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
    <section ref={root} className="border-t py-24 md:py-32">
      <div className="container">
        <div className="hh-vibe-head text-center mb-12 md:mb-16 px-6">
          <p className="text-sm uppercase tracking-[0.2em] text-purple-600 mb-3">
            The vibe
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl mx-auto">
            What it looks like
          </h2>
          <p className="text-muted-foreground mt-6 max-w-xl mx-auto leading-relaxed">
            Focused mornings, nice scenery in the afternoon. We&apos;ll share the
            location when we make offers.
          </p>
        </div>

        <div className="hh-vibe-grid mx-auto max-w-6xl px-4 md:px-6 grid grid-cols-12 gap-3 md:gap-5 auto-rows-[260px] sm:auto-rows-[320px] lg:auto-rows-[380px]">
          {SKETCHES.map((s, i) => (
            <figure
              key={s.src}
              className={`hh-vibe-tile col-span-12 ${s.span} relative overflow-hidden rounded-[var(--radius)] border bg-white shadow-sm transition-shadow duration-300 hover:shadow-md group`}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                priority={i < 2}
                sizes="(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </figure>
          ))}
        </div>

        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mt-10">
          Pencil on paper · sketches for vibes only
        </p>
      </div>
    </section>
  );
}
