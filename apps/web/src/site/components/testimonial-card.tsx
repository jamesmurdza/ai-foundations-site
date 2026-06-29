import Image from "next/image";

import { Card, CardContent } from "@site/components/ui/card";
import { cn } from "@site/lib/utils";

interface TestimonialCardProps {
  name: string;
  username: string;
  image: string;
  text: string;
  className?: string;
}

export function TestimonialCard({ name, username, image, text, className }: TestimonialCardProps) {
  return (
    <Card
      className={cn(
        "w-full h-full flex flex-col border-0 bg-transparent shadow-none",
        className,
      )}
    >
      <CardContent className="flex flex-col items-start gap-6 p-7 h-full">
        <p className="text-foreground/90 text-lg md:text-xl leading-relaxed">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            aria-hidden="true"
            focusable="false"
            className="inline-block mr-1.5 mb-[3px] h-5 w-5 text-primary/70"
          >
            <path
              d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z"
              fill="currentcolor"
            />
          </svg>
          {text}
        </p>
        <div className="flex items-center gap-4 w-full mt-auto">
          <div className="relative size-14 shrink-0">
            <Image
              alt={`${name}'s profile picture`}
              src={image}
              fill
              className="rounded-full object-cover ring-2 ring-muted ring-offset-2 ring-offset-background"
            />
          </div>
          <div>
            <p className="font-semibold leading-none text-foreground text-lg">{name}</p>
            <p className="mt-1.5 leading-none text-muted-foreground/80">@{username}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
