"use client";

import { Accordion } from "@/components/ui/accordion";
import { FaqItem } from "@/components/faq-item";

const FAQS = [
  {
    q: "Does it cost anything?",
    a: "No tuition. We fund travel and accommodation — partially or fully, depending on the spot and your situation. We share the details when we make offers. If money is the only thing in the way, tell us in the application and we'll figure it out.",
  },
  {
    q: "Where is it?",
    a: "We'll share the location with selected applicants. It's somewhere quiet, beautiful, and good for focused work — not a tourist trip.",
  },
  {
    q: "When is it?",
    a: "Dates are shared with selected applicants. We pick on a rolling basis, so the sooner you apply, the better.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. Code, low-code, or no-code — what matters is whether you build. Some of the most interesting people we've met don't write code at all.",
  },
  {
    q: "What's expected of me?",
    a: "Show up, build, and ship. We're picking for builder energy and willingness to work hard for four weeks. No vacationing, no half-presence.",
  },
  {
    q: "How do you decide?",
    a: "We read every application. We're picking for fit, not pedigree. We want six people who'll make each other better — diverse in background, geography, and how they build.",
  },
  {
    q: "What happens after?",
    a: "If it goes well, you leave with shipped projects, a portfolio walkthrough, and people who'll vouch for what you built. We stay in touch and help where we can.",
  },
];

export function FaqSection() {
  return (
    <section className="py-24 border-t bg-muted/20">
      <div className="container">
        <div className="mx-2 md:mx-10 px-6 md:px-12 flex flex-col items-start gap-10 md:flex-row">
          <div className="flex flex-col gap-3 items-start md:w-1/3">
            <p className="text-sm uppercase tracking-[0.2em] text-purple-600">
              FAQ
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">
              The honest answers.
            </h2>
            <p className="text-muted-foreground mt-2">
              Got something we didn&apos;t cover?{" "}
              <a
                href="mailto:contact@aifoundations.school"
                className="text-purple-600 hover:underline"
              >
                Email us.
              </a>
            </p>
          </div>
          <Accordion
            type="single"
            collapsible
            className="w-full md:w-2/3 max-w-3xl flex flex-col gap-4"
          >
            {FAQS.map(({ q, a }) => (
              <FaqItem key={q} question={q} answer={a} />
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
