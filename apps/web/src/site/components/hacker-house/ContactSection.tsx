"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@site/lib/gsap";
import { Button } from "@site/components/ui/button";

const EMAIL = "summerschool@aifoundations.school";

export function ContactSection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hh-contact", {
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
            once: true,
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
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
          <h2 className="hh-contact font-heading text-3xl md:text-4xl font-semibold tracking-tight">
            Want to learn more?
          </h2>
          <p className="hh-contact mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Have a question or want to hear more about the AI Summer School? Get
            in touch and we&apos;ll tell you everything.
          </p>
          <div className="hh-contact mt-8">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 h-12">
              <a href={`mailto:${EMAIL}`}>Email us</a>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              <a
                href={`mailto:${EMAIL}`}
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                {EMAIL}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
