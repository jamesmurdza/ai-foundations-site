"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

export function HostsSection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hh-host", {
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            once: true,
          },
          y: 30,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.15,
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="py-24 md:py-32 border-t bg-muted/20">
      <div className="container">
        <div className="mx-2 md:mx-10 px-6 md:px-12 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-purple-600 mb-3">
            Hosts
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl mb-16 mx-auto">
            Who you&apos;ll be in the house with.
          </h2>
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 max-w-4xl mx-auto">
            <div className="hh-host flex flex-col items-center text-center">
              <div className="relative w-32 h-32 mb-6 rounded-full overflow-hidden border">
                <Image
                  src="/images/James.avif"
                  alt="James Murdza"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-3">
                James Murdza
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Software developer and educator. Has taught coding to thousands
                through videos and livestreams. Co-founder of{" "}
                <a
                  href="https://gitwit.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  gitwit.dev
                </a>
                . Will probably teach you a debug trick that saves you a week.
              </p>
            </div>
            <div className="hh-host flex flex-col items-center text-center">
              <div className="relative w-32 h-32 mb-6 rounded-full overflow-hidden border">
                <Image
                  src="/images/Burhan.jpg"
                  alt="Burhan Khatri"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-3">
                Burhan Khatri
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Builder shipping with AI for the past few years. Product AI
                engineer at Astera Software, and built{" "}
                <a
                  href="https://gitwit.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  gitwit.dev
                </a>{" "}
                with James. Runs AI Foundations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
