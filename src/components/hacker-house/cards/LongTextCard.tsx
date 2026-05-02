"use client";

import { useState } from "react";
import { CardStage } from "./CardStage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  category: string;
  prompt: string;
  helperText?: string;
  initial?: string;
  minChars?: number;
  maxChars?: number;
  onContinue: (text: string) => void;
};

export function LongTextCard({
  category,
  prompt,
  helperText,
  initial,
  minChars = 80,
  maxChars = 600,
  onContinue,
}: Props) {
  const [value, setValue] = useState(initial ?? "");
  const trimmed = value.trim();
  const isValid = trimmed.length >= minChars && trimmed.length <= maxChars;
  const remaining = maxChars - value.length;

  return (
    <CardStage>
      <div className="flex-1 flex flex-col">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
          {category}
        </p>
        <h2 className="font-heading text-2xl font-semibold leading-tight mb-2">
          {prompt}
        </h2>
        {helperText && (
          <p className="text-sm text-muted-foreground mb-4">{helperText}</p>
        )}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, maxChars))}
          rows={7}
          className="mt-2 w-full px-4 py-3 bg-background rounded-lg border text-base resize-none leading-relaxed"
          autoFocus
        />
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span
            className={cn(
              trimmed.length < minChars && "text-amber-600",
              isValid && "text-emerald-600",
            )}
          >
            {trimmed.length < minChars
              ? `${minChars - trimmed.length} more characters`
              : "Looks good"}
          </span>
          <span>{remaining} left</span>
        </div>
      </div>
      <div className="pt-6">
        <Button
          size="lg"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          disabled={!isValid}
          onClick={() => onContinue(trimmed)}
        >
          Continue →
        </Button>
      </div>
    </CardStage>
  );
}
