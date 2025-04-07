import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface FaqItemProps {
  question: string;
  answer: string;
  className?: string;
}

export function FaqItem({ question, answer, className }: FaqItemProps) {
  return (
    <AccordionItem
      value={question}
      className={cn("border-b-0 px-8 bg-card rounded-2xl border", className)}
    >
      <AccordionTrigger className="text-left text-lg hover:no-underline [&&gt;svg]:hidden font-semibold [&[data-state=open]&gt;div&gt;svg&gt;path:first-child]:rotate-90 gap-3">
        {question}
        <div className="size-10 rounded-[0.5rem] flex items-center justify-center shrink-0">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6 text-muted-foreground"
          >
            <path
              d="M12 5v14"
              className="origin-center transition-transform duration-300 ease-out"
            />
            <path d="M5 12h14" />
          </svg>
        </div>
      </AccordionTrigger>
      <AccordionContent className="text-lg text-muted-foreground">{answer}</AccordionContent>
    </AccordionItem>
  );
}
