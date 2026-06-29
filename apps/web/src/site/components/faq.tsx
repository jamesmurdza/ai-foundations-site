'use client';
'use client';
import { Users } from "lucide-react";

import { Button } from "@site/components/ui/button";
import { Accordion } from "@site/components/ui/accordion";
import { FaqItem } from "@site/components/faq-item";

export function Faq() {
  return (
    <section className="py-20">
      <div className="container flex flex-col items-start gap-10 md:flex-row">
        <div className="flex flex-col gap-3 items-start">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Everything you need to know about our courses and classes.
          </p>
          <a href="mailto:contact@aifoundations.school">
            <Button className="mt-4 gap-2 font-semibold">
              <Users size={16} />
              Contact us
            </Button>
          </a>
        </div>
        <Accordion type="single" collapsible className="w-full max-w-3xl flex flex-col gap-4">
          <FaqItem
            answer="All of our courses are free and available on YouTube/YouTube Live."
            question="Are your courses free or paid?"
          />
          <FaqItem
            answer="Yes! We have just started teaching in person workshops and are planning many more. Please contact us for more information."
            question="Do you teach in person workshops?"
          />
          <FaqItem
            answer="We are developing a low-code AI agents course, and a AI agents with Minecraft course. We also want to go deeper into machine learning with a series on LLMs from scratch."
            question="What is your next course?"
          />
        </Accordion>
      </div>
    </section>
  );
}
