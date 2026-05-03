"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

const WEEKS = [
  {
    label: "Week 01",
    title: "Foundations",
    body: "We meet, we set up, we pick the first thing each of you will ship by Friday. By the weekend, six things exist that didn't on Monday.",
  },
  {
    label: "Week 02",
    title: "Building",
    body: "Heads down. You ship a second project — bigger, more ambitious — with a public post explaining what you made and why.",
  },
  {
    label: "Week 03",
    title: "Shipping in public",
    body: "Two weeks of momentum behind you. We help you write, post, and respond. Strangers start using what you built.",
  },
  {
    label: "Week 04",
    title: "Demo Day",
    body: "Final piece of work. Recorded portfolio walkthroughs. A live demo to investors, founders, and operators we'll bring in.",
  },
];

export function ScheduleSection() {
  registerGsap();
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const trackEl = track.current;
          const rootEl = root.current;
          if (!trackEl || !rootEl) return;

          const distance = () =>
            Math.max(0, trackEl.scrollWidth - rootEl.clientWidth);

          gsap.to(trackEl, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: rootEl,
              pin: true,
              scrub: 0.5,
              anticipatePin: 1,
              start: "top top",
              end: () => "+=" + distance(),
              invalidateOnRefresh: true,
            },
          });
        },
      );
      mm.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.from(".hh-week", {
            scrollTrigger: {
              trigger: root.current,
              start: "top 75%",
              once: true,
            },
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.12,
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="border-t bg-background relative overflow-hidden md:h-screen md:flex md:flex-col md:justify-center py-24 md:py-0"
    >
      <div className="container">
        <div className="mx-2 md:mx-10 px-6 md:px-12 mb-12 md:mb-16 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-purple-600 mb-3">
            The 4 weeks
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl mx-auto">
            Build → Ship → Be seen → Demo.
          </h2>
        </div>
      </div>
      <div className="md:relative md:w-full">
        <div
          ref={track}
          className="md:flex md:flex-nowrap md:will-change-transform md:gap-8 md:pl-[10vw] md:pr-[10vw]"
        >
          {WEEKS.map((w, i) => (
            <article
              key={w.label}
              className="hh-week mb-6 md:mb-0 md:flex-shrink-0 md:w-[60vw] md:max-w-xl rounded-[var(--radius)] bg-card border p-8 md:p-12 mx-6 md:mx-0"
            >
              <p className="text-sm uppercase tracking-widest text-purple-600 mb-4">
                {w.label}
              </p>
              <h3 className="font-heading text-3xl md:text-5xl font-semibold leading-tight mb-6">
                {w.title}
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                {w.body}
              </p>
              <p className="mt-8 text-sm text-muted-foreground">
                {String(i + 1).padStart(2, "0")} / {WEEKS.length}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
