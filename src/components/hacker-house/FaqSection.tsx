"use client";

import { Accordion } from "@/components/ui/accordion";
import { FaqItem } from "@/components/faq-item";

const FAQS = [
  {
    q: "Does it cost anything?",
    a: "No tuition. We cover travel and accommodation (partially or fully depending on your situation). If cost is an issue, mention it in your application and we'll work something out.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. Code, low-code, or no-code — what matters is whether you build.",
  },
  {
    q: "How do you decide?",
    a: "We read every application. We're looking for people who'll work well together, from different backgrounds and places.",
  },
  {
    q: "What happens after?",
    a: "You leave with finished projects, a portfolio video, and hopefully some good references. We stay in touch.",
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
              Questions
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
