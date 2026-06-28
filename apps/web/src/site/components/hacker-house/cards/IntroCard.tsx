"use client";

import { CardStage } from "./CardStage";
import { Button } from "@site/components/ui/button";

export function IntroCard({ onBegin }: { onBegin: () => void }) {
  return (
    <CardStage showPeek={false}>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
          Summer School · Application
        </p>
        <h2 className="font-heading text-3xl font-semibold leading-tight mb-6">
          A short application. About 10 minutes.
        </h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>
            Tell us about yourself and your interests!
          </p>
          <p>
            You can leave at any point and come back. Your answers are saved as
            you go.
          </p>
        </div>
      </div>
      <div className="pt-6">
        <Button
          size="lg"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          onClick={onBegin}
        >
          Begin →
        </Button>
      </div>
    </CardStage>
  );
}
