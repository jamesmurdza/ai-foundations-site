"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@site/lib/gsap";

const MENTORS = [
  { name: "James", img: "/images/James.jpg" },
  { name: "Burhan", img: "/images/Burhan.jpg" },
  { name: "Fleo", img: "/images/FleoMae.jpg" },
  { name: "Taniya", img: "/images/default-avatar.png" },
  { name: "Harsh", img: "/images/default-avatar.png" },
];

export function MentorsSection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hh-mentor", {
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
            once: true,
          },
          y: 24,
          opacity: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.08,
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root}>
      <div className="container">
        <div className="border-t mt-12 px-6 md:px-12 pt-12 pb-12 text-center">
          <h2 className="hh-mentor font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-10">
            Mentors
          </h2>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-8">
            {MENTORS.map((m) => (
              <div
                key={m.name}
                className="hh-mentor flex flex-col items-center gap-3"
              >
                <div className="relative w-28 h-28 rounded-full overflow-hidden border">
                  <Image
                    src={m.img}
                    alt={m.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <p className="font-medium">{m.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
