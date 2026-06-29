import { AccordionItem, AccordionTrigger, AccordionContent } from "@site/components/ui/accordion";
import { cn } from "@site/lib/utils";

interface FaqItemProps {
  question: string;
  answer: string;
  className?: string;
}

export function FaqItem({ question, answer, className }: FaqItemProps) {
  return (
    <AccordionItem
      value={question}
      className={cn("border-b-0 px-8 rounded-lg border-0", className)}
    >
      <AccordionTrigger className="text-left text-lg hover:no-underline font-semibold gap-3">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-lg text-muted-foreground">{answer}</AccordionContent>
    </AccordionItem>
  );
}
