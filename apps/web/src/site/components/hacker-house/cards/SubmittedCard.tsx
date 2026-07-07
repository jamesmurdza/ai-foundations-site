"use client";

import { CardStage } from "./CardStage";
import { Button } from "@site/components/ui/button";
import Link from "next/link";

export function SubmittedCard({ name }: { name?: string }) {
  return (
    <CardStage showPeek={false}>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="font-heading text-3xl font-semibold leading-tight mb-3">
          {name ? `Thanks, ${name.split(" ")[0]}.` : "Thanks."}
        </h2>
        <p className="text-muted-foreground max-w-sm">
          Your application is in. We read every one. You&apos;ll hear back from us
          by email within two weeks.
        </p>
      </div>
      <div className="pt-6">
        <Button
          asChild
          size="lg"
          variant="outline"
          className="w-full"
        >
          <Link href="/summer-school">Back to summer school page</Link>
        </Button>
      </div>
    </CardStage>
  );
}
