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
            Guides
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl mb-16 mx-auto">
            Your guides
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
                AI engineer at Daytona. Builds developer tools and teaches through livestreams.
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
                AI engineer at Astera. Microsoft Learn Student Ambassador. Runs AI Foundations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
