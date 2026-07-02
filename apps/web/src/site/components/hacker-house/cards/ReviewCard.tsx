"use client";

import { CardStage } from "./CardStage";
import { Button } from "@site/components/ui/button";
import { getVisibleQuestions } from "@site/lib/hacker-house/questions";
import type { ApplicationState } from "@site/lib/hacker-house/types";

type Props = {
  state: ApplicationState;
  onEdit: (target: { step: ApplicationState["step"]; cardIndex: number }) => void;
  onSubmit: () => void;
  submitting?: boolean;
};

export function ReviewCard({ state, onEdit, onSubmit, submitting }: Props) {
  const dyn = state.dynamicQuestions ?? [];
  const visibleQuestions = getVisibleQuestions(state.answers);

  return (
    <CardStage className="!min-h-[560px]">
      <div className="flex-1 flex flex-col overflow-hidden">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
          Review
        </p>
        <h2 className="font-heading text-2xl font-semibold leading-tight mb-4">
          Looks good?
        </h2>
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 text-sm">
          <Section
            title="Your answers"
            items={visibleQuestions.map((q, i) => ({
              key: q.id,
              prompt: q.prompt,
              answer: state.answers[q.id] ?? "—",
              onClick: () =>
                onEdit({ step: "static", cardIndex: i }),
            }))}
          />
          {dyn.length > 0 && (
            <Section
              title="Follow-ups"
              items={dyn.map((q, i) => ({
                key: q.id,
                prompt: q.question,
                answer: state.answers[q.id] ?? "—",
                onClick: () =>
                  onEdit({ step: "dynamic", cardIndex: i }),
              }))}
            />
          )}
          {(state.portfolioUrl || state.githubUrl || state.otherUrl) && (
            <Section
              title="Links"
              items={[
                state.portfolioUrl && {
                  key: "portfolio",
                  prompt: "Portfolio",
                  answer: state.portfolioUrl,
                  onClick: () => onEdit({ step: "links", cardIndex: 0 }),
                },
                state.githubUrl && {
                  key: "github",
                  prompt: "GitHub",
                  answer: state.githubUrl,
                  onClick: () => onEdit({ step: "links", cardIndex: 0 }),
                },
                state.otherUrl && {
                  key: "other",
                  prompt: "Other",
                  answer: state.otherUrl,
                  onClick: () => onEdit({ step: "links", cardIndex: 0 }),
                },
              ].filter(Boolean) as {
                key: string;
                prompt: string;
                answer: string;
                onClick: () => void;
              }[]}
            />
          )}
        </div>
      </div>
      <div className="pt-6">
        <Button
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting…" : "Submit application"}
        </Button>
      </div>
    </CardStage>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: { key: string; prompt: string; answer: string; onClick: () => void }[];
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              onClick={item.onClick}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/40 transition-colors"
            >
              <p className="text-xs text-muted-foreground">{item.prompt}</p>
              <p className="text-sm line-clamp-2">{item.answer}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
