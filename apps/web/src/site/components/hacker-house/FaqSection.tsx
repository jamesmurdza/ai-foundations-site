"use client";

import { Accordion } from "@site/components/ui/accordion";
import { FaqItem } from "@site/components/faq-item";

const FAQS = [
  {
    q: "How much does it cost?",
    a: "You should apply whatever your financial situation is. Our goal is to make this program as accessible as possible.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. Code, low-code, or no-code — what matters is whether you build.",
  },
  {
    q: "How do you decide?",
    a: "We're looking for people with a large potential to grow and who will work well together. We will select a diverse group from different backgrounds and places.",
  },
];

export function FaqSection() {
  return (
    <section className="py-24 md:py-32 border-t bg-muted/20">
      <div className="container">
        <div className="mx-2 md:mx-10 px-6 md:px-12 flex flex-col items-start gap-10 md:flex-row">
          <div className="flex flex-col gap-3 items-start md:w-1/3">
            <p className="text-sm uppercase tracking-[0.2em] text-primary">
              FAQ
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight">
              Questions
            </h2>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Got something we didn&apos;t cover?{" "}
              <a
                href="mailto:contact@aifoundations.school"
                className="text-primary hover:underline"
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
