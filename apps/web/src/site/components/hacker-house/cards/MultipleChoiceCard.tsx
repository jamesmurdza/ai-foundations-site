"use client";

import { useEffect } from "react";
import { CardStage } from "./CardStage";
import { cn } from "@site/lib/utils";

type Props = {
  prompt: string;
  options: string[];
  helperText?: string;
  category?: string;
  current?: string;
  onAnswer: (option: string) => void;
};

export function MultipleChoiceCard({
  prompt,
  options,
  helperText,
  category,
  current,
  onAnswer,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < options.length) {
        e.preventDefault();
        e.stopPropagation();
        onAnswer(options[idx]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [options, onAnswer]);

  return (
    <CardStage>
      <div className="flex-1 flex flex-col">
        {category && (
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
            {category}
          </p>
        )}
        <h2 className="font-heading text-2xl font-semibold leading-tight mb-2">
          {prompt}
        </h2>
        {helperText && (
          <p className="text-sm text-muted-foreground mb-4">{helperText}</p>
        )}
        <div className="mt-4 space-y-2">
          {options.map((opt, i) => {
            const isCurrent = current === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onAnswer(opt)}
                className={cn(
                  "group w-full text-left px-4 py-3 rounded-lg border transition-all",
                  "bg-background hover:bg-purple-50 hover:border-purple-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
                  isCurrent && "bg-purple-100 border-purple-400",
                )}
              >
                <span className="inline-flex items-center gap-3">
                  <span className="inline-flex w-6 h-6 items-center justify-center rounded-md border bg-muted/40 text-xs font-medium group-hover:bg-purple-100 group-hover:border-purple-300">
                    {i + 1}
                  </span>
                  <span className="text-sm">{opt}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="pt-6 text-xs text-muted-foreground">
        Tap an option, or press {options.map((_, i) => `${i + 1}`).join("/")}.
      </p>
    </CardStage>
  );
}
