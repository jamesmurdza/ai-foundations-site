"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@site/lib/gsap";

// Email is assembled in JS (never emitted as a plain address or mailto: in the
// server-rendered HTML) to reduce scraping by spam bots.
const EMAIL_USER = "summerschool";
const EMAIL_DOMAIN = "aifoundations.school";

export function ContactSection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);

  const openEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${EMAIL_USER}@${EMAIL_DOMAIN}`;
  };

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
          <h2 className="hh-contact font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-3">
            Learn more
          </h2>
          <p className="hh-contact text-lg text-muted-foreground leading-relaxed">
            Have a question or want to hear more about the AI Summer School? Send
            us{" "}
            <a
              href="#"
              onClick={openEmail}
              className="font-medium text-foreground underline underline-offset-4"
            >
              an email
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
