"use client";

import { useState } from "react";
import { CardStage } from "./CardStage";
import { Button } from "@/components/ui/button";

type Props = {
  initialPortfolio?: string;
  initialGithub?: string;
  initialOther?: string;
  onContinue: (urls: {
    portfolioUrl?: string;
    githubUrl?: string;
    otherUrl?: string;
  }) => void;
};

export function LinksCard({
  initialPortfolio,
  initialGithub,
  initialOther,
  onContinue,
}: Props) {
  const [portfolio, setPortfolio] = useState(initialPortfolio ?? "");
  const [github, setGithub] = useState(initialGithub ?? "");
  const [other, setOther] = useState(initialOther ?? "");

  return (
    <CardStage>
      <div className="flex-1 flex flex-col">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
          Show your work
        </p>
        <h2 className="font-heading text-2xl font-semibold leading-tight mb-2">
          Drop a few links if you have them.
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Optional. Anything that helps us understand what you build.
        </p>
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium">Portfolio / personal site</span>
            <input
              type="url"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              placeholder="https://"
              className="mt-1 w-full px-4 py-3 bg-background rounded-lg border text-base"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">GitHub</span>
            <input
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/…"
              className="mt-1 w-full px-4 py-3 bg-background rounded-lg border text-base"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Anywhere else (X, LinkedIn, etc.)</span>
            <input
              type="url"
              value={other}
              onChange={(e) => setOther(e.target.value)}
              placeholder="https://"
              className="mt-1 w-full px-4 py-3 bg-background rounded-lg border text-base"
            />
          </label>
        </div>
      </div>
      <div className="pt-6">
        <Button
          size="lg"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() =>
            onContinue({
              portfolioUrl: portfolio.trim() || undefined,
              githubUrl: github.trim() || undefined,
              otherUrl: other.trim() || undefined,
            })
          }
        >
          Continue →
        </Button>
      </div>
    </CardStage>
  );
}
